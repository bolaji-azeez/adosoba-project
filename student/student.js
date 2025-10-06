const API = "https://gtc-adosoba-be.onrender.com/api";

const val = (id) => (document.getElementById(id)?.value || "").trim();

function getProjectsStrict() {
  const nodes = document.querySelectorAll("#projects-container .project");
  const items = [];
  const errors = [];

  nodes.forEach((proj, idx) => {
    const row = idx + 1;
    const projectName =
      proj.querySelector(".projectTitle")?.value?.trim() || "";
    const status = proj.querySelector(".status")?.value?.trim() || "";
    const grade = proj.querySelector(".grade")?.value?.trim() || "";
    const description = proj.querySelector(".description")?.value?.trim() || "";

    const anyFilled = projectName || status || grade || description;

    // If nothing is filled, skip the row entirely.
    if (!anyFilled) return;

    // Enforce required fields for a "touched" row.
    if (!projectName || !status) {
      errors.push(
        `Project row ${row}: ${!projectName ? "Title" : ""}${
          !projectName && !status ? " & " : ""
        }${!status ? "Status" : ""} required`
      );
      return;
    }

    items.push({ projectName, status, grade, description });
  });

  return { items, errors };
}

function addProject() {
  const container = document.getElementById("projects-container");
  const div = document.createElement("div");
  div.classList.add("project");
  div.innerHTML = `
      <label>Project Title</label>
      <input type="text" class="projectTitle" placeholder="Enter Project Title" />

      <label>Status</label>
      <select class="status">
        <option value="">-- Select Status --</option>
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
  container.appendChild(div);
}

function cancel() {
  window.location.href = "../dashboard/dashboard.html";
}

async function ensureDepartmentInput() {
  const params = new URLSearchParams(location.search);
  let departmentId =
    params.get("departmentId") || localStorage.getItem("departmentId") || "";

  if (departmentId) return departmentId;

  const form = document.querySelector(".form-container");
  const buttons = document.querySelector(".buttons");

  const wrap = document.createElement("div");
  wrap.id = "dept-picker";
  wrap.innerHTML = `
      <p class="p">Department</p>
      <label for="departmentSelect">DEPARTMENT</label>
      <select id="departmentSelect" required>
        <option value="">-- Select Department --</option>
      </select>
    `;
  form.insertBefore(wrap, buttons);

  try {
    const res = await fetch(`${API}/departmnet/all-departments`, {
      cache: "no-store",
    });
    const data = await res.json();
    const select = document.getElementById("departmentSelect");
    (data.departments || []).forEach((d) => {
      const opt = document.createElement("option");
      opt.value = d._id;
      opt.textContent = d.departmentName || d.name || d._id;
      select.appendChild(opt);
    });
  } catch (e) {
    console.error("Failed to load departments:", e);
    alert("Could not load departments. Please try again.");
  }

  return "";
}

async function AddStudent(/* evt */) {
  // evt?.preventDefault(); // if used on <form onsubmit="AddStudent(event)">

  const params = new URLSearchParams(location.search);
  let departmentId =
    params.get("departmentId") || localStorage.getItem("departmentId") || "";
  if (!departmentId) {
    departmentId = document.getElementById("departmentSelect")?.value || "";
  }

  // IMPORTANT: ensure your HTML has id="studentID"
  const required = {
    studentID: val("studentID"),
    firstName: val("firstName"),
    lastName: val("lastName"),
    email: val("email"),
    phoneNumber: val("phone"), // input id="phone"
    enrollmentDate: val("enrollmentDate"),
    closureDate: val("closureDate"),
    session: val("session"),
    department: departmentId,
  };

  const missing = Object.entries(required).filter(([, v]) => !v);
  if (missing.length) {
    alert(
      "Please fill all required fields: " + missing.map(([k]) => k).join(", ")
    );
    return;
  }
  const { items: project, errors: projectErrors } = getProjectsStrict();

  if (projectErrors.length) {
    alert(
      "Please fix the following before submitting:\n• " +
        projectErrors.join("\n• ")
    );
    return;
  }
  const payload = {
    ...required,
    project,
    status: "Active",
  };

  console.log(required.closureDate);
  console.log(payload);

  try {
    const res = await fetch(`${API}/student/create-student`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
      body: JSON.stringify(payload),
    });

    const result = await res.json().catch(() => ({}));

    if (!res.ok) {
      alert(result?.message || result?.error || "Failed to create student.");
      return;
    }

    alert("Student added successfully!");
    localStorage.setItem("departmentId", required.department);

    window.location.href = `../../departmnet/department.html?id=${encodeURIComponent(
      required.department
    )}`;
  } catch (err) {
    console.error(err);
    alert("Something went wrong while creating the student.");
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  if (!document.querySelector("#projects-container .project")) addProject();
  await ensureDepartmentInput();
});

window.AddStudent = AddStudent;
window.addProject = addProject;
window.cancel = cancel;
