// let error = document.getElementById("error");
//       let btn = document.getElementById("btn");
//       btn.addEventListener("click", function () {
//         let email = document.getElementById("email").value;
//         let password = document.getElementById("pass").value;
//         if (!email || !password) {
//           error.textContent = "All  fields required";
//          error.style.display = 'block';

//         setTimeout(() => {
//             error.style.display = 'none';
//         }, 3000);
//         } else if (password !== "12345" || email !== "confidencezion2008@gmail.com") {
//             error.textContent = "Incorrect email or password";
//             error.style.display = 'block';
//         setTimeout(() => {
//              error.style.display = 'none';
//         }, 3000);
//         } else {
//             alert("Login successful");
//         }
//        window.location.href = "../dashboard/dashboard.html"
//       });

 
      
            const btn = document.getElementById("btn")
            const passwordInput = document.getElementById("pass").value
            const emailIn = document.getElementById("email").value
            const errorMessage = document.getElementById('error')


            // emailIn.focus()
            // //handle login for submission
            // signIn.addEventListener('click', function(e) {
            //     e.preventDefault()

                // const email = emailIn.value.trim();
                // const password = passwordInput.value;
                
            // })

            function signIn(email, password){
                const baseUrl = "https://gtc-adosoba-be.onrender.com"

                fetch(`${baseUrl}/api/user/login`,{
                   method: 'POST',
                   headers: {
                    'content-Type': 'application/json'
                   },
                   body: JSON.stringify({
                       emailIn: email,
                       passwordInput: password           
                   }) 
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('login failed')
                        console.log(Error)
                    }
                    return response.json()
                })
                .then(data => {
                    console.log('Login successful', data)
                    
                })
                .catch(error => {
                    console.log('Error', error);
                    errorMessage.innerHTML = "login failed, Please try again"
                })
            }
        