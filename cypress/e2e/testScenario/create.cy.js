const PATH_API = '/Test%20Scenario/TestScenarioCreate'
const validToken = Cypress.env('VALID_TOKEN');

const validProjectId = Cypress.env('VALID_PROJECT_ID');
const validBuildId = Cypress.env('VALID_BUILD_ID');
const validModuleId = Cypress.env('VALID_MODULE_ID');

const validRequirementId = 88;
const validScenarioName = 'Novo Cenário de Teste';
const validDescription = 'Descrição detalhada do cenário de teste';

describe('API rest - Test Scenario Create - /test_scenario/create', () => {


  it('Status Code is 200', () => {

    createTestScenario({
      token: validToken,
      project_id: validProjectId,
      test_scenario_name: validScenarioName,
      description: validDescription
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.body).to.have.property('success');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Cria cenário de teste com todos os campos preenchidos', () => {

    createTestScenario({
      token: validToken,
      project_id: validProjectId,
      build_id: validBuildId,
      module_id: validModuleId,
      requirement_id: validRequirementId,
      test_scenario_name: validScenarioName,
      description: validDescription
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.body).to.have.property('success');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Ignora campo extra no body', () => {

    createTestScenario({
      token: validToken,
      project_id: validProjectId,
      test_scenario_name: validScenarioName,
      description: validDescription,
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
        test_scenario_name: validScenarioName,
        description: validDescription
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {

    createTestScenario({
      token: "' OR 1=1 --",
      project_id: validProjectId,
      test_scenario_name: validScenarioName,
      description: validDescription
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  it('Headers devem conter CORS e content-type', () => {

    createTestScenario({
      token: validToken,
      project_id: validProjectId,
      test_scenario_name: validScenarioName,
      description: validDescription
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Falha após múltiplas requisições rápidas (rate limit)', () => {

    const requests = Array(10).fill(0).map(() =>
      createTestScenario({
        token: validToken,
        project_id: validProjectId,
        test_scenario_name: validScenarioName,
        description: validDescription
      })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  it('Permite criar o mesmo cenário de teste rapidamente', () => {

    createTestScenario({
      token: validToken,
      project_id: validProjectId,
      test_scenario_name: validScenarioName,
      description: validDescription
    })
      .then(() => createTestScenario({
        token: validToken,
        project_id: validProjectId,
        test_scenario_name: validScenarioName,
        description: validDescription
      }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });
});