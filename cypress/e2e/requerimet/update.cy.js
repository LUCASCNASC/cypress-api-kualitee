const PATH_API = '/Requirement/update';
const validToken = Cypress.env('VALID_TOKEN')

const validProjectId = Cypress.env('VALID_PROJECT_ID');

const validRequirementId = 123;
const validAssignedTo = 111;
const validTitle = 'Título do requisito';
const validSummary = 'Resumo do requisito';

describe('Requirements Update - /requirements/update', () => {

  it('Status Code: 200', () => {
    requirementsUpdate({
      token: validToken,
      project_id: validProjectId,
      id: validRequirementId,
      requirement_title: validTitle,
      requirement_summary: validSummary,
      assignedto: validAssignedTo
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.body).to.have.property('success');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code: 200', () => {
    requirementsUpdate({
      token: validToken,
      project_id: validProjectId,
      id: validRequirementId,
      requirement_title: validTitle,
      requirement_summary: validSummary,
      assignedto: validAssignedTo,
      ...optionalFields
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('success');
    });
  });

  it('Status Code: 200', () => {
    cy.fixture('arquivo_teste.txt', 'base64').then(fileContent => {
      requirementsUpdate({
        token: validToken,
        project_id: validProjectId,
        id: validRequirementId,
        requirement_title: validTitle,
        requirement_summary: validSummary,
        assignedto: validAssignedTo,
        'attachment[]': {
          fileContent,
          fileName: 'arquivo_teste.txt',
          mimeType: 'text/plain'
        }
      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('success');
      });
    });
  });

  it('Status Code: 400, 401, 403', () => {
    requirementsUpdate({
      project_id: validProjectId,
      id: validRequirementId,
      requirement_title: validTitle,
      requirement_summary: validSummary,
      assignedto: validAssignedTo
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code: 200', () => {
    requirementsUpdate({
      token: validToken,
      project_id: validProjectId,
      id: validRequirementId,
      requirement_title: validTitle,
      requirement_summary: validSummary,
      assignedto: validAssignedTo,
      foo: 'bar'
    }).then(response => {
      expect([200, 400]).to.include(response.status);
    });
  });

  it('Status Code: 400, 415', () => {
    cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      body: {
        token: validToken,
        project_id: validProjectId,
        id: validRequirementId,
        requirement_title: validTitle,
        requirement_summary: validSummary,
        assignedto: validAssignedTo
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    requirementsUpdate({
      token: "' OR 1=1 --",
      project_id: validProjectId,
      id: validRequirementId,
      requirement_title: validTitle,
      requirement_summary: validSummary,
      assignedto: validAssignedTo
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  it('Status Code: 429', () => {
    requirementsUpdate({
      token: validToken,
      project_id: validProjectId,
      id: validRequirementId,
      requirement_title: validTitle,
      requirement_summary: validSummary,
      assignedto: validAssignedTo
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code: 429', () => {
    const requests = Array(10).fill(0).map(() =>
      requirementsUpdate({
        token: validToken,
        project_id: validProjectId,
        id: validRequirementId,
        requirement_title: validTitle,
        requirement_summary: validSummary,
        assignedto: validAssignedTo
      })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  it('Status Code: 200, 400, 401, 409', () => {
    requirementsUpdate({
      token: validToken,
      project_id: validProjectId,
      id: validRequirementId,
      requirement_title: validTitle,
      requirement_summary: validSummary,
      assignedto: validAssignedTo
    })
      .then(() => requirementsUpdate({
        token: validToken,
        project_id: validProjectId,
        id: validRequirementId,
        requirement_title: validTitle,
        requirement_summary: validSummary,
        assignedto: validAssignedTo
      }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });
});