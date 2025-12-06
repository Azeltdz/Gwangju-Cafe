function renderProfile(user, username) {
    const container = document.getElementById("profile_container");

    const passwordMasked = user.password
        ? "∙".repeat(String(user.password).length)
        : "";

    const a = user.address || {};
    const fullAddress = [
        a.houseNumber,
        a.street,
        a.barangay,
        "San Luis, Batangas, Philippines"
    ].filter(Boolean).join(", ");

    container.innerHTML = `
        <div class="profile_box">
            <h3>PROFILE</h3>
            <hr>

            <div class="profile_details">
                <div class="profile_data">

                    <p><strong>Full Name:</strong> ${escapeHtml(a.firstName || "")} ${escapeHtml(a.lastName || "")}</p>

                    <p><strong>Username:</strong> ${escapeHtml(username)}</p>

                    <p><strong>Email:</strong> ${escapeHtml(user.email)}</p>

                    <p><strong>Password:</strong> ${passwordMasked}</p>

                    <h4 class="profile_section_title">ADDRESS:</h4>
                    <p class="indent">${escapeHtml(fullAddress)}</p>

                </div>
                <hr>
            </div>
        </div>
    `;
}