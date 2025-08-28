document.getElementById("btn").addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("pass").value;
  const errorMsg = document.getElementById("error");

  if (!email || !password) {
    errorMsg.textContent = "All fields are required!";
    return;
  }

  try {
    const res = await fetch("https://gtc-adosoba-be.onrender.com/api/user/login", { 
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      errorMsg.textContent = data.message || "Login failed!";
    } else {
      alert(data.message); 

      window.location.href = "../dashboard/dashboard.html";
    }
  } catch (error) {
    console.error("Error:", error);
    errorMsg.textContent = "Something went wrong!";
  }
});
