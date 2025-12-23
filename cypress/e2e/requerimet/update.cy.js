const PATH_API = '/Requirement/update';
const validToken = Cypress.env('VALID_TOKEN')

const validProjectId = Cypress.env('VALID_PROJECT_ID');

const validRequirementId = 123;
const validAssignedTo = 111;
const validTitle = 'Título do requisito';
const validSummary = 'Resumo do requisito';

describe('API rest - Requirements Update - /requirements/update', () => {

  it('Status Code is 200', () => {
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

  it('Atualiza requirement com todos os campos preenchidos', () => {
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

  it('Atualiza requirement com envio de arquivo (attachment)', () => {
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

  it('Falha sem token', () => {
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

  it('Ignora campo extra no body', () => {
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

  it('Falha com Content-Type application/json', () => {
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

  it('Headers devem conter CORS e content-type', () => {
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

  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
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

  it('Permite requisições duplicadas rapidamente', () => {
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