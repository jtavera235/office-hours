import { createAndLoginTA, checkNavbarLoaded } from "../../utils";

describe("User can edit their name", () => {
  beforeEach(() => {
    createAndLoginTA();
  });

  it("Changes TA name to Bill Benzel", function () {
    cy.visit(`/settings`).then(() => {
      cy.get("body").should("contain", "First Name");
      checkNavbarLoaded();
      cy.percySnapshot("Profile Page");
      cy.get('[data-cy="firstNameInput"]')
        .should("be.visible")
        .click()
        .type("{backspace}{backspace}{backspace}{backspace}Billiam");
      cy.get('[data-cy="lastNameInput"]')
        .should("be.visible")
        .click()
        .type(
          "{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}Benzel"
        );
      cy.get('[style="padding-top: 50px;"] > .ant-btn > span')
        .should("contain", "Ok")
        .click();

      // getting the avatar and making sure the name is properly changed to Bill Benzel (BB)
      cy.get("body").should("contain", "BB");
    });
  });
});
