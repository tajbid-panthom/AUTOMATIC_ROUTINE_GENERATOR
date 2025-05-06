document.querySelectorAll(".form-check-label").forEach((label) => {
  label.addEventListener("click", function () {
    const checkbox = document.getElementById(this.getAttribute("for"));
    const icon = this.querySelector("i");
    // Use timeout to allow checkbox state to update before changing icon
    setTimeout(() => {
      if (checkbox.checked) {
        icon.classList.remove("bi-circle", "text-muted");
        icon.classList.add("bi-check-circle-fill", "text-success");
      } else {
        icon.classList.remove("bi-check-circle-fill", "text-success");
        icon.classList.add("bi-circle", "text-muted");
      }
    }, 0);
  });
});
