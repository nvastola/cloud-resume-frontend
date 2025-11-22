describe('Cloud Resume Website', () => {
  it('should load the homepage successfully', () => {
    cy.visit('/')
    cy.get('html').should('exist')
  })

  it('should have a title', () => {
    cy.visit('/')
    cy.title().should('not.be.empty')
  })

  it('should contain resume content', () => {
    cy.visit('/')
    // Add specific checks for your resume content
    // Example: cy.contains('Noah')
    cy.get('body').should('contain.text', 'Noah')
  })

  it('should load without JavaScript errors', () => {
    cy.visit('/', {
      onBeforeLoad(win) {
        cy.stub(win.console, 'error').as('consoleError')
      }
    })
    cy.get('@consoleError').should('not.be.called')
  })

  it('should have proper HTTP status', () => {
    cy.request('/').its('status').should('equal', 200)
  })
})