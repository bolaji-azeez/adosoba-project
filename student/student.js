function getProjects() {
  const projectElements = document.querySelectorAll(
    "#projects-container .project"
  );
  let projects = [];

  projectElements.forEach((proj) => {
    projects.push({
      projectName: proj.querySelector(".projectTitle").value,
      status: proj.querySelector(".status").value,
      grade: proj.querySelector(".grade").value,
      description: proj.querySelector(".description").value,
    });
  });

  return projects;
}

async function AddStudent() {
  const studentData = {
    studentID: document.getElementById("StudentId").value,
    firstName: document.getElementById("firstName").value,
    lastName: document.getElementById("lastName").value,
    email: document.getElementById("email").value,
    phoneNumber: document.getElementById("phone").value,
    enrollmentDate: document.getElementById("enrollmentDate").value,
    department: "68aedd52ec127801e20f9aab", // example fixed deptId
    project: getProjects(),
  };

  try {
    const response = await fetch(
      "https://gtc-adosoba-be.onrender.com/api/student/create-student",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(studentData),
      }
    );

    if (response.ok) {
      const result = await response.json();
      alert("Student added successfully!");
      console.log(result);
    } else {
      const error = await response.json();
      alert("Error: " + error.message);
    }
  } catch (err) {
    console.log(err);
    console.error(err);
    alert("Something went wrong!");
  }
}

function addProject() {
  const container = document.getElementById("projects-container");
  const newProject = document.createElement("div");
  newProject.classList.add("project");

  newProject.innerHTML = `
    <label>Project Title</label>
    <input type="text" class="projectTitle" placeholder="Enter Project Title" />

    <label>Status</label>
    <select class="status">
      <option value="In Progress">In Progress</option>
      <option value="On Hold">On Hold</option>
      <option value="Terminated">Terminated</option>
      <option value="Uncompleted">Uncompleted</option>
      <option value="Completed">Completed</option>
    </select>

    <label>Grade</label>
    <input type="text" class="grade" placeholder="Enter grade" />

    <label>Description</label>
    <textarea class="description" placeholder="Enter description"></textarea>
    <hr/>
  `;

  container.appendChild(newProject);
}

function cancel() {
  document.querySelector(".form-container").reset?.(); // fallback if form tag is missing
  document.getElementById("projects-container").innerHTML = ""; // clear projects
  addProject(); // add one empty project back
}
