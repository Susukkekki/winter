import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react';

// https://stackoverflow.com/questions/38552003/how-to-decode-jwt-token-in-javascript-without-using-a-library
function parseJwt (token) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  return JSON.parse(jsonPayload);
}

async function get_product_list(keycloak) {
  const response = await fetch('/api/v1/product', {
    headers: {
      'Authorization': `Bearer ${keycloak.token}`
    }
  });

  if (response.status == 200) {
    const text = await response.text();
    return text;
  }

  return "Error! Status Code : " + response.status;
}


async function get_product_detail(keycloak, id) {
  const response = await fetch(`/api/v1/product/${id}`, {
    headers: {
      'Authorization': `Bearer ${keycloak.token}`
    }
  });

  if (response.status == 200) {
    const text = await response.text();
    return text;
  }

  return "Error! Status Code : " + response.status;
}

async function get_cart_list(keycloak) {
  const response = await fetch('/api/v1/cart', {
    headers: {
      'Authorization': `Bearer ${keycloak.token}`
    }
  });

  if (response.status == 200) {
    const text = await response.text();
    return text;
  }

  return "Error! Status Code : " + response.status;
}


async function get_cart_detail(keycloak, id) {
  const response = await fetch(`/api/v1/cart/${id}`, {
    headers: {
      'Authorization': `Bearer ${keycloak.token}`
    }
  });

  if (response.status == 200) {
    const text = await response.text();
    return text;
  }

  return "Error! Status Code : " + response.status;
}

function App({keycloak}) {
  const [productList, setProductList] = useState([])
  const [productDetail, setProductDetail] = useState([])
  const [cartList, setCartList] = useState([])
  
  const token = parseJwt(keycloak.token);

  // HACK: 불완전한 코드다. Group 이 여러개면 menu 를 merge 할 필요가 있음.
  const admin = (token['group']['tree'][Object.keys(token['group']['tree'])[0]]['menu']['admin'] != undefined) ? true : false;
  const cart = (token['group']['tree'][Object.keys(token['group']['tree'])[0]]['menu']['cart'] != undefined) ? true : false;
  const product = (token['group']['tree'][Object.keys(token['group']['tree'])[0]]['menu']['product'] != undefined) ? true : false;

  useEffect(()=> {
    get_product_list(keycloak).then(text => {
      setProductList(text)
    })

    get_product_detail(keycloak, 2).then(text => {
      setProductDetail(text)
    })

    get_cart_list(keycloak).then(text => {
      setCartList(text)
    })
  })

  return (
    <div className="App">
      <header className="App-header">

        <table><tr>
        {
          admin && (
          <td style={{padding: "15px"}}>Admin</td>          
          )
        }
        {
          product && (
            <td style={{padding: "15px"}}><ins>Product</ins></td>
          )
        }
        {
          cart && (
          <td style={{padding: "15px"}}>Cart</td>
          )
        }
        </tr></table>

        <img src={logo} className="App-logo" alt="logo" />
        <p>
          SHOP-WEBAPP
        </p>
        <a
          className="App-link"
          href="http://wintershop.io/cart"
          // target="_blank"
          rel="noopener noreferrer"
        >
          Move to cart
        </a>

        <p>
          Product List : {productList}
        </p>

        <p>
          Product Detail : {productDetail}
        </p>

        <p>
          Cart List : {cartList}
        </p>

        {
          !!keycloak.authenticated && (
            <li>
              <a href="javascript:void(0);" onClick={() => keycloak.logout()}>Logout</a>
            </li>
          )
        }
      </header>
    </div>
  );
}

export default App;
