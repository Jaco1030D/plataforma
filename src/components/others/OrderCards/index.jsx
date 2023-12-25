import React, { useEffect, useState } from 'react'
import { useUpdateDocument } from '../../../hooks/useUpdateDocument'
import axios from 'axios'

const apiUrl = 'https://api.stripe.com/v1/checkout/sessions/'

const token = 'sk_test_51OF205HR5yfE4YaFBUT1a4yatFHaX5PYhlFa4mpqRSadaqYngNuWDm9lBqQSgTykKZx519Xb4fMcFn1dZthlKgrK00AwSyXZQx'

const OrdersCards = ({orders, admin = false}) => {
  const {updateDocument} = useUpdateDocument("archives")
  const [url, setUrl] = useState("")

  const handleClick = async (downloadURL) => {
    const response = await fetch(downloadURL);
    console.log(response);
  }

  useEffect(() => {
    if (orders.status === 'open') {
      fetch(apiUrl+orders.id_payment, {
        method: 'GET', 
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.status} - ${response.statusText}`);
          }
          return response.json();
        })
        .then(data => {
          const {url, payment_status, status} = data
          const date = new Date();
          const initialDate = new Date(date)
          const finalDate = new Date(date)
          finalDate.setDate(finalDate.getDate() + 2)
          if (payment_status === 'paid') {
            updateDocument(orders.id, {statusPayment: payment_status, status, initialDate: initialDate.toLocaleString(), finalDate: finalDate.toLocaleString() })
            
          } else {
            updateDocument(orders.id, {statusPayment: payment_status, status })

          }
          
          setUrl(url)
        })
        .catch(error => {
          console.error('Erro na requisição:', error);
        });
    }
    
  },[orders])
  return (
    <div>
    <h2>{orders.file}</h2>
    Prazo
    <p>{orders.numOrder}</p>
    <p>{orders.deadlines}</p>
    <hr />
    De
    <p>{orders.language_origin}</p>
    para
    <div>{orders.language_translation.map((language, index) => (
      <p key={index} >{language}</p>
    ))}</div>
    <hr />
    <p>{orders.numWords}</p>
    <p onClick={() => handleClick(orders.archivelink)}>{orders.numPages}</p>
    <a href={orders.archivelink}>arquivo selecionado</a>
    {orders.statusPayment !== "paid" ? <p>Ainda não pago</p> : <p>Ja pago</p>}
    {!admin && orders.statusPayment !== "paid" && orders.status !== "expired" && <button><a href={url}>Pagar</a></button>}
    {orders.archivesTranslated && <p>Arquivo ja entregue</p>}
    {orders?.archivesTranslated && orders.archivesTranslated.map(item => (
      <>
      <a href={item}>Arquivo traduzido</a>
      <br />
      </>
    ))}
    </div>
  )
}

export default OrdersCards