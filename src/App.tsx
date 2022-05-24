import React, { useCallback, useState } from 'react';
// import logo from './logo.svg';
import './App.css';

function isEdge() { 
  return window.navigator.userAgent.indexOf("app.edge") >= 0;
}


function getEdgeProvider(callback: Function) {
  const myWindow: any = window
  if (myWindow.edgeProvider != null) {
    callback(myWindow.edgeProvider);
  } else {
    document.addEventListener("edgeProviderReady", function() {
      callback(myWindow.edgeProvider);
    });
  }
}

function App() {
  const [edgeProvider, setEdgeProvider] = useState<any | void>(undefined)
  const [currencyCodes, setCurrencyCodes] = useState<string>(`["BTC", "BCH", "ETH", "ETH-USDC"]`)
  const [currencyCode, setCurrencyCode] = useState<string | void>(undefined)
  const [readDataText, setReadDataText] = useState<string | void>(undefined)
  const [readKey, setReadKey] = useState<string | void>(undefined)
  const [receiveAddress, setReceiveAddress] = useState<string>('')
  const [messageToSign, setMessageToSign] = useState<string>('')
  const [signedMessage, setSignedMessage] = useState<string>('')
  const [spendAddress, setSpendAddress] = useState<string>('')
  const [spendCurrencyCode, setSpendCurrencyCode] = useState<string | void>(undefined)
  const [amount, setAmount] = useState<string>('')
  const [uri, setUri] = useState<string>('')
  const [key, setKey] = useState<string | void>(undefined)
  const [value, setValue] = useState<string | void>(undefined)

  
  const chooseWallet = useCallback(async () => {
    if (edgeProvider) {
      let ccArray = []
      try {
        let cc = currencyCodes
          .replace(/“/g, '"')
          .replace(/”/g, '"')
          .replace(/‘/g, '\'')
          .replace(/’/g, '\'') 

        ccArray = JSON.parse(cc)
        if (typeof ccArray !== 'object' || !(ccArray instanceof Array)) {
          throw new Error('Invalid currency code array')
        }
        await edgeProvider.chooseCurrencyWallet(ccArray).then(setCurrencyCode)
        const result = await edgeProvider.getReceiveAddress()
        setReceiveAddress(result.publicAddress)
      } catch (e: any) {
        console.log(e.message)
      }
    }
   }, [edgeProvider, currencyCodes])

   const signMessage = useCallback(async () => {
    if (edgeProvider) {
      const data = await edgeProvider.signMessage(messageToSign)
        setSignedMessage(data)
    }
   }, [edgeProvider, messageToSign])

   const readData = useCallback(async () => {
    if (edgeProvider) {
      const data = await edgeProvider.readData([readKey])
      // const dataText = JSON.stringify(data, null, 2)
      // console.log('readData', dataText)
      if (readKey != null)
        setReadDataText(data[readKey])
    }
   }, [edgeProvider, readKey])

   const writeData = useCallback(async () => {
    if (edgeProvider) {
      if (typeof key === 'string') {
        const v = value !== '' ? value : undefined
        const data = await edgeProvider.writeData({ [key]: v })
        console.log('writeData', JSON.stringify(data, null, 2))  
      }
    }
   }, [edgeProvider, key, value])

   const requestSpend = useCallback(() => {
    const cCode = spendCurrencyCode === '' ? undefined : spendCurrencyCode
    if (edgeProvider) edgeProvider.requestSpend([{
      publicAddress: spendAddress,
      exchangeAmount: amount
      }],
      {
        metadata: { // Optional metadata to tag this transaction with
          name: 'Bitrefill',
          category: 'Expense:Gift Cards',
          notes: 'Purchase $200 Whole Foods gift card. Order ID 1234567890abcd'
        },
        currencyCode: cCode,
        orderId: 'cWmFSzYKfRMGrN'
      })
   }, [edgeProvider, spendAddress, amount, spendCurrencyCode])

   const requestSpendUri = useCallback(() => {
    if (edgeProvider) {
      edgeProvider.requestSpendUri(uri, {
        metadata: {
          name: 'My Name',
          category: 'Expense:Donation',
          notes: 'Just Some Notes'
        }
      })
    }
   }, [edgeProvider, uri])

  if (!edgeProvider) {
    getEdgeProvider((r: any) => setEdgeProvider(r))
  }

  if (!isEdge()) {
    return (
      <div>
        Not running in Edge
      </div>
    )
  }

  const eptext = (edgeProvider != null ? 'We Have Edge Provider' : 'No Edge Provider')
  const cctext = `Currency Code: ${currencyCode}`
  const ratext = `Receive Address: ${receiveAddress}`
  const readtext = `${readKey}: ${readDataText}`
  const signedMsgText = `Signed Message: ${signedMessage}`

  return (
        <body className="App-body">
          {eptext}<br/><br/>

          <input autoCapitalize="off" value={currencyCodes ?? ''} className='App-input' onChange={e => setCurrencyCodes(e.target.value)} placeholder="Enter Currency Codes" /><br/><br/>
          <button className="App-button" onClick={chooseWallet}>
            Choose Wallets
          </button><br/>
          {cctext}<br/>
          {ratext}<br/>
          <hr/>

          <input autoCapitalize="off" value={spendAddress ?? ''} className='App-input' onChange={e => setSpendAddress(e.target.value)} placeholder="Enter Public Address" /><br/>
          <input autoCapitalize="off" value={amount ?? ''} className='App-input' onChange={e => setAmount(e.target.value)} placeholder="Enter Amount" /><br/>
          <input autoCapitalize="off" value={spendCurrencyCode ?? ''} className='App-input' onChange={e => setSpendCurrencyCode(e.target.value)} placeholder="Enter Currency Code (optional)" /><br/>
          <button className="App-button" onClick={requestSpend}>
            Spend Funds
          </button><br/>

          <hr/>

          <input autoCapitalize="off" value={messageToSign ?? ''} className='App-input' onChange={e => setMessageToSign(e.target.value)} placeholder="Enter Message to Sign" /><br/>
          <button className="App-button" onClick={signMessage}>
            Sign Message (BTC only)
          </button><br/>
          {signedMsgText}
          <br/>

          <hr/>
          <input autoCapitalize="off" value={uri ?? ''} className='App-input' onChange={e => setUri(e.target.value)} placeholder="Enter URI" /><br/>
          <button className="App-button" onClick={requestSpendUri}>
            Spend Funds URI
          </button><br/>

          <hr/>

          Key <button onClick={() => setKey('username')}>username</button> <button onClick={() => setKey('authToken')}>authToken</button><br/>
          <input autoCapitalize="off" value={key ?? ''} className='App-input' onChange={e => setKey(e.target.value)} placeholder="Enter Key" /><br/><br/>

          Value<br/>
          <input autoCapitalize="off" value={value ?? ''} className='App-input' onChange={e => setValue(e.target.value)} placeholder="Enter Value" /><br/>

          <button className="App-button" onClick={writeData}>
            writeData
          </button><br/>
          <hr/>

          Key to Read <button onClick={() => setReadKey('username')}>username</button> <button onClick={() => setReadKey('authToken')}>authToken</button><br/>
          <input autoCapitalize="off" value={readKey ?? ''} className='App-input' onChange={e => setReadKey(e.target.value)} placeholder="Enter Key to Read" /><br/>

          <button className="App-button" onClick={readData}>
            readData
          </button><br/>
          {readtext}<br/><br/><br/>
          {/* <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.tsx</code> and save to reload
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a> */}
        </body>
  );
}

export default App