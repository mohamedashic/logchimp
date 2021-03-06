describe("Sign up", () => {
	it("Visit join page", () => {
		cy.visit("/join");
	});

	it("Show 'Create your account' heading", () => {
		cy.get("[data-test=join-page-heading]").contains("Create your account");
	});

	it("Link to login page", () => {
		cy.contains("Log in").should("have.attr", "href", "/login");
	});

	describe("'Required' error message", () => {
		it("Show input field error", () => {
			cy.get("[data-test=create-account-button]").click();
		});

		it("Email address is required", () => {
			cy.get("[data-test=email-input] .input-error-message").should(
				"contain",
				"Required"
			);
		});

		it("Password is required", () => {
			cy.get("[data-test=password-input] .input-error-message").should(
				"contain",
				"Required"
			);
		});
	});

	describe("User exists", () => {
		it("Enter email address & password", () => {
			cy.get("[data-test=email-input] input")
				.type("{selectall}email@example.com")
				.should("have.value", "email@example.com");

			cy.get("[data-test=password-input] input")
				.type("{selectall}password{enter}")
				.should("have.value", "password");
		});

		it("Check 'User exists' error message", () => {
			cy.get("[data-test=email-input] .input-error-message").should(
				"contain",
				"Exists"
			);
		});
	});
});
