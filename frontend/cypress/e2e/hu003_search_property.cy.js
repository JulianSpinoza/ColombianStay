import { formatNumber } from "../../src/global/utils/general_utils";

describe("HU003: Search Property", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  describe('Search by keyword', () => { 
    const correctText = "Acogedor";

    beforeEach(() => {
      cy.get('[data_testid="search-listing"]').as("searchBar");
      cy.intercept("GET", "**/listings/search/*").as("getSearchListings");
      cy.get("@searchBar")
        .find('[data_testid="search-button"]')
        .as("searchButton");
    });

    it("Happy Path: Word with exact format", () => {
      const searchText = correctText;

      cy.get("@searchBar")
        .find('[data_testid="search-input"]')
        .clear()
        .type(searchText);

      cy.get("@searchButton").click();

      cy.wait("@getSearchListings").then((interception) => {
        expect(interception.response.statusCode).to.equal(200);
      });

      // Verificar que existen resultados en el UI
      cy.get('[data_testid="listing-results"]').should("be.visible");
      cy.get('[data_testid="listing-item"]')
        .should("exist")
        .and("have.length.greaterThan", 0);
      
      // Validar el contenido de los resultados
      cy.get('[data_testid="listing-item"]').each(($el) => {
        cy.wrap($el).should("contain.text", correctText);
      });

    });

    it("Happy Path: Word with inexact format", () => {
      const searchText = "acOgeDor";

      cy.get("@searchBar")
        .find('[data_testid="search-input"]')
        .clear()
        .type(searchText);

      cy.get("@searchButton").click();

      cy.wait("@getSearchListings").then((interception) => {
        expect(interception.response.statusCode).to.equal(200);
      });

      // Verificar que existen resultados en el UI
      cy.get('[data_testid="listing-results"]').should("be.visible");
      cy.get('[data_testid="listing-item"]')
        .should("exist")
        .and("have.length.greaterThan", 0);

      // Validar el contenido de los resultados
      cy.get('[data_testid="listing-item"]').each(($el) => {
        cy.wrap($el).should("contain.text", correctText);
      });

    });

    it("Border Path: Unexisting word on the properties", () => {
      const searchText = "AbCdEcC";

      cy.get("@searchBar")
        .find('[data_testid="search-input"]')
        .clear()
        .type(searchText);

      cy.get("@searchButton").click();

      cy.wait("@getSearchListings").then((interception) => {
        expect(interception.response.statusCode).to.equal(200);
      });

      // Verificar que no existen resultados en el UI
      cy.get('[data_testid="listing-results"]').should("not.exist");
      cy.get('[data_testid="listing-item"]').should("not.exist");

      // Validar que se muestra el mensaje amigable
      cy.get('[data_testid="api_state_empty"]').should("be.visible");

      // Validar que se muestra el componente de recomendaciones
      cy.get('[data_testid="listing-suggestions"]').should("be.visible");
      
    })

  });

  describe('Search by closed filter', () => {
    const correctSearch = {
      place: "Bogotá",
      price_per_night: 300000,
      property_type: "apartment",
      bedrooms: 2,
      bathrooms: 2,
      guests: 3
    };

    beforeEach(() => {
      cy.get('[data_testid="search-listing"]').as("searchBar");
      cy.intercept("GET", "**/listings/search/*").as("getSearchListings");
      cy.get("@searchBar")
        .find('[data_testid="search-button"]')
        .as("searchButton");
      cy.get("@searchBar")
        .find('[data_testid="show-advanced-filters-button"]')
        .as("showAdvancedFiltersButton");
    });

    // Duda: Como saber si dentro de los resultados sale 
    // la propiedad de prueba?

    it("Happy Path: Exact property found", () => {
      cy.get("@searchBar")
        .find('[data_testid="search-input"]')
        .clear()
        .type(correctSearch.place);

      cy.contains(
        '[data_testid="search-bar-suggestions-item"]',
        correctSearch.place,
      )
        .first()
        .click();

      cy.get("@showAdvancedFiltersButton").click();

      cy.get("@searchBar")
        .find('[data_testid="min-price-input"]')
        .clear()
        .type(`${correctSearch.price_per_night}`);

      cy.get("@searchBar")
        .find('[data_testid="max-price-input"]')
        .clear()
        .type(`${correctSearch.price_per_night + 100000}`);

      cy.get("@searchBar")
        .find(
          `[data_testid="property_type-item-${correctSearch.property_type}"]`,
        )
        .click();

      cy.get("@searchBar")
        .find('[data_testid="bedrooms-quantity-input"]')
        .type(`{selectall}${correctSearch.bedrooms}`);

      cy.get("@searchBar")
        .find('[data_testid="bathrooms-quantity-input"]')
        .type(`{selectall}${correctSearch.bathrooms}`);

      cy.get("@searchBar")
        .find('[data_testid="guests-quantity-input"]')
        .type(`{selectall}${correctSearch.guests}`);

      cy.get("@searchButton").click();

      cy.wait("@getSearchListings").then((interception) => {
        expect(interception.response.statusCode).to.equal(200);
      });

      // Verificar que existen resultados en el UI
      cy.get('[data_testid="listing-results"]').should("be.visible");
      cy.get('[data_testid="listing-item"]')
        .should("exist")
        .and("have.length.greaterThan", 0);

      // Validar el contenido de los resultados
      cy.get('[data_testid="listing-item"]').each(($el) => {
        cy.wrap($el).should("contain.text", correctSearch.place);
      });

    })

    it("Happy Path: Inexact property found", () => {
      const changedLocation = "cundinamarca";

      cy.get("@searchBar")
        .find('[data_testid="search-input"]')
        .clear()
        .type(changedLocation);

      cy.contains(
        '[data_testid="search-bar-suggestions-item"]',
        changedLocation,
        { matchCase: false }
      )
        .first()
        .click();

      cy.get("@showAdvancedFiltersButton").click();

      cy.get("@searchBar")
        .find('[data_testid="min-price-input"]')
        .clear()
        .type(`${correctSearch.price_per_night}`);

      cy.get("@searchBar")
        .find('[data_testid="max-price-input"]')
        .clear()
        .type(`${correctSearch.price_per_night + 100000}`);

      cy.get("@searchBar")
        .find(
          `[data_testid="property_type-item-${correctSearch.property_type}"]`,
        )
        .click();

      cy.get("@searchBar")
        .find('[data_testid="bedrooms-quantity-input"]')
        .type(`{selectall}${correctSearch.bedrooms}`);

      cy.get("@searchBar")
        .find('[data_testid="bathrooms-quantity-input"]')
        .type(`{selectall}${correctSearch.bathrooms}`);

      cy.get("@searchBar")
        .find('[data_testid="guests-quantity-input"]')
        .type(`{selectall}${correctSearch.guests}`);

      cy.get("@searchButton").click();

      cy.wait("@getSearchListings").then((interception) => {
        expect(interception.response.statusCode).to.equal(200);
      });

      // Verificar que existen resultados en el UI
      cy.get('[data_testid="listing-results"]').should("be.visible");
      cy.get('[data_testid="listing-item"]')
        .should("exist")
        .and("have.length.greaterThan", 0);

      // Validar el contenido de los resultados
      cy.get('[data_testid="listing-item"]').each(($el) => {
        cy.wrap($el).should("contain.text", correctSearch.place);
      });
    
    });

    it("Error Path: Location data of a non-existent place", () => {
      const changedLocation = "Ciudad de Mexico";

      cy.get("@searchBar")
        .find('[data_testid="search-input"]')
        .clear()
        .type(changedLocation);

      cy.get("@showAdvancedFiltersButton").click();

      cy.get("@searchBar")
        .find('[data_testid="min-price-input"]')
        .clear()
        .type(`${correctSearch.price_per_night}`);

      cy.get("@searchBar")
        .find('[data_testid="max-price-input"]')
        .clear()
        .type(`${correctSearch.price_per_night + 100000}`);

      cy.get("@searchBar")
        .find(
          `[data_testid="property_type-item-${correctSearch.property_type}"]`,
        )
        .click();

      cy.get("@searchBar")
        .find('[data_testid="bedrooms-quantity-input"]')
        .type(`{selectall}${correctSearch.bedrooms}`);

      cy.get("@searchBar")
        .find('[data_testid="bathrooms-quantity-input"]')
        .type(`{selectall}${correctSearch.bathrooms}`);

      cy.get("@searchBar")
        .find('[data_testid="guests-quantity-input"]')
        .type(`{selectall}${correctSearch.guests}`);

      cy.get("@searchButton").click();

      cy.wait("@getSearchListings").then((interception) => {
        expect(interception.response.statusCode).to.equal(200);
      });

      // Verificar que no existen resultados en el UI
      cy.get('[data_testid="listing-results"]').should("not.exist");
      cy.get('[data_testid="listing-item"]').should("not.exist");

      // Validar que se muestra el mensaje amigable
      cy.get('[data_testid="api_state_empty"]').should("be.visible");

      // Validar que se muestra el componente de recomendaciones
      cy.get('[data_testid="listing-suggestions"]').should("be.visible");

    });

    it("Happy Path: Correct persistence", () => {
      cy.get("@searchBar")
        .find('[data_testid="search-input"]')
        .clear()
        .type(correctSearch.place);

      cy.contains(
        '[data_testid="search-bar-suggestions-item"]',
        correctSearch.place,
      )
        .first()
        .click();

      cy.get("@showAdvancedFiltersButton").click();

      cy.get("@searchBar")
        .find('[data_testid="min-price-input"]')
        .clear()
        .type(`${correctSearch.price_per_night}`);

      cy.get("@searchBar")
        .find('[data_testid="max-price-input"]')
        .clear()
        .type(`${correctSearch.price_per_night + 100000}`);

      cy.get("@searchBar")
        .find(
          `[data_testid="property_type-item-${correctSearch.property_type}"]`,
        )
        .click();

      cy.get("@searchBar")
        .find('[data_testid="bedrooms-quantity-input"]')
        .type(`{selectall}${correctSearch.bedrooms}`);

      cy.get("@searchBar")
        .find('[data_testid="bathrooms-quantity-input"]')
        .type(`{selectall}${correctSearch.bathrooms}`);

      cy.get("@searchBar")
        .find('[data_testid="guests-quantity-input"]')
        .type(`{selectall}${correctSearch.guests}`);

      cy.get("@searchButton").click();

      cy.wait("@getSearchListings").then((interception) => {
        expect(interception.response.statusCode).to.equal(200);
      });

      cy.get('[data_testid="listing-item"]').its("length").as("resultsCount");

      cy.get('[data_testid="listing-item"]').first().click();

      cy.go("back");

      // Verifica la misma cantidad de resultados
      cy.get("@resultsCount").then((count) => {
        cy.get('[data-testid="listing-item"]').should("have.length", count);
      });

      // Verifica la presencia de los mismos filtros
      cy.get("@searchBar")
        .find('[data_testid="location-selected-type"]')
        .should("contain.text",correctSearch.place);

      cy.get("@showAdvancedFiltersButton").click();

      const correctMinValue = formatNumber(correctSearch.price_per_night);
      const correctMaxValue = formatNumber(correctSearch.price_per_night + 100000);

      cy.get("@searchBar")
        .find('[data_testid="min-price-input"]')
        .should("have.value", correctMinValue)

      cy.get("@searchBar")
        .find('[data_testid="max-price-input"]')
        .should("have.value", correctMaxValue);

      cy.get("@searchBar")
        .find(
          `[data_testid="property_type-item-${correctSearch.property_type}"]`,
        )
        .should("have.class", "active");

      cy.get("@searchBar")
        .find('[data_testid="bedrooms-quantity-input"]')
        .should("have.value", `${correctSearch.bedrooms}`);

      cy.get("@searchBar")
        .find('[data_testid="bathrooms-quantity-input"]')
        .should("have.value", `${correctSearch.bathrooms}`);

      cy.get("@searchBar")
        .find('[data_testid="guests-quantity-input"]')
        .should("have.value", `${correctSearch.guests}`);

    });

  })

    


});
