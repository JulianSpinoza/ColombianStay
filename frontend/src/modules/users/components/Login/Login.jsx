import React, {useEffect, useState} from "react";
import './Login.css'
function Login({auth}) {

    // const LOGIN_URL = 'auth/login'
    // const [userName, setUserName] = useState("");
    // const [password, setPassword] = useState("");


    
    // const login = (userName,password)=>{
    //     return axios
    //   .post(LOGIN_URL, {
    //     "username":userName,
    //     "password":password,
    //   })  
    //   .then((response) => {
    //         console.log(response)
    //         return response

    //   })
    // }

    // const handLogin = async (e) => {
    //     e.preventDefault();
    //     const dataResponse = await login(userName,password);
    //     const resStatus = dataResponse.status;
    //     const resInfo = dataResponse.data; 
    //     console.log(dataResponse);

    //     if (resStatus === 200){
    //         auth(true)
    //         alert('Bienvenido: '+resInfo.firstName+" Email: "+resInfo.email )
    //     }else{
    //         alert('Credenciales invalidas')
    //     }
    // }

    return (
        <div>
            <form className="form" >
                <div  class="title">Welcome,<br/><span>sign up to continue</span></div>
                {/*<label class="input" htmlFor='username'>Username:</label>
                <input  type="text" id="username" onChange={(e) => setUserName(e.target.value)}/> */}
                
                <input class="input" name="username" placeholder="Username" type="text" id="username" />
                
                {/* <label class="input" htmlFor='password'>Password:</label> 
                <input type="password" id="password" onChange={(e) => setPassword(e.target.value)}/>*/}

                <input class="input" name="password" placeholder="Password" type="password" id="password" />

                <button class="button-confirm" >Let`s go</button>

                
            </form>
        </div>
    )
}

export default Login