 let error = document.getElementById("error");
      let btn = document.getElementById("btn");
      btn.addEventListener("click", function () {
        let email = document.getElementById("email").value;
        let password = document.getElementById("pass").value;
        if (!email || !password) {
          error.textContent = "All  fields required";
         error.style.display = 'block';

        setTimeout(() => {
            error.style.display = 'none';
        }, 3000);
        } else if (password !== "12345" || email !== "confidencezion2008@gmail.com") {
            error.textContent = "Incorrect email or password";
            error.style.display = 'block';
        setTimeout(() => {
             error.style.display = 'none';
        }, 3000);
        } else {
            alert("Login successful");
        }
       window.location.href = "../dashboard/dashboard.html"
      });

 
