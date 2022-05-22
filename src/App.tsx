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
  const [currencyCode, setCurrencyCode] = useState<string | void>(undefined)
  const [readDataText, setReadDataText] = useState<string | void>(undefined)
  const [readKey, setReadKey] = useState<string | void>(undefined)
  const [key, setKey] = useState<string | void>(undefined)
  const [value, setValue] = useState<string | void>(undefined)

  
  const chooseWallet = useCallback(() => {
    if (edgeProvider) edgeProvider.chooseCurrencyWallet(['BTC', 'BCH', '']).then(setCurrencyCode)
   }, [edgeProvider])

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
    if (edgeProvider) edgeProvider.requestSpend([{
      publicAddress: '39LPRaWgum1tPBsxToeydvYF9bbNAUdBZX',
      exchangeAmount: '0.002'
      }],
      {
        metadata: { // Optional metadata to tag this transaction with
          name: 'Bitrefill',
          category: 'Expense:Gift Cards',
          notes: 'Purchase $200 Whole Foods gift card. Order ID 1234567890abcd'
        }, 
        orderId: 'cWmFSzYKfRMGrN'
      })
   }, [edgeProvider])

   const requestSpendUri = useCallback(() => {
    if (edgeProvider) {
      edgeProvider.requestSpendUri('bitcoin:?r=https://bitpay.com/i/58y1c5HE2VKLwTG8mfFcyf', {
        metadata: {
          name: 'My Name',
          category: 'Expense:Donation',
          notes: 'Just Some Notes'
        }
      })
    }
   }, [edgeProvider])

  console.log('edgeProvider:', edgeProvider)
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

  const eptext = (edgeProvider != null ? 'Have Edge Provider' : 'No Edge Provider')
  const cctext = `Currency Code: ${currencyCode}`

  const readtext = `${readKey}: ${readDataText}`
  return (
        <body className="App-body">
          {eptext}<br/>
          {cctext}<br/><br/>
          <button className="App-button" onClick={chooseWallet}>
            Choose Wallets
          </button><br/><br/>

          <button className="App-button" onClick={requestSpend}>
            Spend Funds
          </button><br/><br/>

          <button className="App-button" onClick={requestSpendUri}>
            Spend Funds URI
          </button><br/><br/>

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