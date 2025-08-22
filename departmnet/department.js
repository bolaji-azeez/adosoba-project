 let btn = document.getElementById("btn");

        btn.addEventListener("click",function() {
          
              let input = document.getElementById("Department").value;
                 let inputs = document.getElementById("Departments").value;
                  let inputss = document.getElementById("Description").value;
                  localStorage.setItem("Department",input);
                   localStorage.setItem("Departments",inputs);
                    localStorage.setItem("Description",inputss);
                
                    window.location.href = "/department/departmentForm.html";
                    console.log('btn')
                
                })