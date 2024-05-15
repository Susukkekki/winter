import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react';

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

  useEffect(()=> {
    get_product_list(keycloak).then(text => {
      setProductList(text)
    })

    get_product_detail(keycloak, 1).then(text => {
      setProductDetail(text)
    })

    get_cart_list(keycloak).then(text => {
      setCartList(text)
    })
  })

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          CART-WEBAPP
        </p>
        <a
          className="App-link"
          href="http://localhost:3000"
          // target="_blank"
          rel="noopener noreferrer"
        >
          Move to shop
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
              <a href='/#' onClick={() => keycloak.logout()}>Logout</a>
            </li>
          )
        }
      </header>
    </div>
  );
}

export default App;
