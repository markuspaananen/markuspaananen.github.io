// index.js
// Author: Ville Heikkiniemi
// Date: 2025-10-06
// Collects form data, validates input, adds timestamp, and appends to table

// modified: Markus Paananen
// Date: 2025-11-10

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("addCourseForm");
    const tableBody = document.getElementById("timetable").querySelector("tbody");
    const timestampInput = document.getElementById("timestamp");

    // Helper to show custom validation error on a specific field
    const showError = (field, message) => {
        // Find or create the error message container
        let errorElement = field.nextElementSibling;

        // If there's no existing error message container, create one
        if (!errorElement || !errorElement.classList.contains("error-message")) {
            errorElement = document.createElement("p");
            errorElement.classList.add("error-message", "text-red-500", "text-sm", "mt-1");
            field.insertAdjacentElement("afterend", errorElement);
        }

        // Set the error message and make it visible
        errorElement.textContent = message;
    };

    // Clear old errors on input
    form.querySelectorAll("input").forEach((input) => {
        input.addEventListener("input", () => {
            // Remove the error message if it exists
            const errorElement = input.nextElementSibling;
            if (errorElement && errorElement.classList.contains("error-message")) {
                errorElement.remove();
            }

            // Clear the custom validity
            input.setCustomValidity("");
        });
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        // Fill hidden timestamp
        const now = new Date();
        timestampInput.value = now.toLocaleString(); // e.g. "6.11.2025, 17:43:12"

        // Get form values + fields
        const nameField = form.fullName;
        const emailField = form.email;
        const phoneField = form.phone;
        const birthDateField = form.birthDate;
        const termsField = form.terms;
        const termsText = form.termsText

        const name = nameField.value.trim();
        const email = emailField.value.trim();
        const phone = phoneField.value.trim();
        const birthDateValue = birthDateField.value;
        const termsChecked = termsField.checked;

        // Full name: at least 2 words, 2+ chars each
        const nameParts = name.split(/\s+/).filter(Boolean);
        const validName =
            nameParts.length >= 2 &&
            nameParts.every(part => /^[A-Za-zÄÖÅäöå]{2,}$/.test(part));
        if (!validName) {
            showError(nameField, "Your name should be 2 words and 2 characters per word, and no numbers.");
            return;
        }

        // Email validation
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            showError(emailField, "This email address is not valid.");
            return;
        }

        // Phone validation (basic pattern: allows digits, +, -, spaces)
        const phonePattern = /^\+358[\d\s-]{6,}$/;
        if (!phonePattern.test(phone)) {
            showError(phoneField, "This phone number is not a valid Finnish phone number, start the number with +358");
            return;
        }

        // Birth date validation
        if (!birthDateValue) {
            showError(birthDateField, "Please enter your birth date.");
            return;
        }
        const birthDate = new Date(birthDateValue);
        const finnishBirthDate = String(birthDate.getDate()).padStart(2, "0") + "." +
            String(birthDate.getMonth() + 1).padStart(2, "0") + "." +
            birthDate.getFullYear();

        const today = new Date();
        const ageDiff = today.getFullYear() - birthDate.getFullYear();
        const hasBirthdayPassed =
            today.getMonth() > birthDate.getMonth() ||
            (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());
        const age = hasBirthdayPassed ? ageDiff : ageDiff - 1;

        if (birthDate > today || age < 13) {
            showError(birthDateField, "You need to be at least 13 years old to submit.");
            return;
        }

        // Terms checkbox
        if (!termsChecked) {
            showError(termsField, "Please accept the terms before submitting.");
            return;
        }

        // --- Passed all validations ---
        const row = document.createElement("tr");

        const data = [
            timestampInput.value,
            name,
            email,
            phone,
            finnishBirthDate,
            termsChecked ? "✅" : "❌"
        ];

        data.forEach((val) => {
            const cell = document.createElement("td");
            cell.textContent = val;
            row.appendChild(cell);
        });

        // Append new row to table
        tableBody.appendChild(row);

        // Reset form
        form.reset();
    });
});
