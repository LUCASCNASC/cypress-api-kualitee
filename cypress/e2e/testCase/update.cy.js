const PATH_API = '/TestCase/Update';
const validToken = Cypress.env('VALID_TOKEN');

const validProjectId = Cypress.env('VALID_PROJECT_ID');
const validBuildId = Cypress.env('VALID_BUILD_ID');
const validModuleId = Cypress.env('VALID_MODULE_ID');

const validId = 1001;
const validScenarioId = 201;
const validRequirementId = 101;

describe('API rest - Test Case Update - /test_case/update', () => {

  it('Status Code is 200', () => {
    testCaseUpdate({
      token: validToken,
      project_id: validProjectId,
      id: validId,
      t_name: 'Nome atualizado',
      summary: 'Resumo atualizado',
      t_execution_type: 'manual',
      t_testing_type: 'Functional',
      t_priority: 'Medium'
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.body).to.have.property('success');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Atualiza caso de teste com todos os campos preenchidos', () => {
    testCaseUpdate({
      token: validToken,
      project_id: validProjectId,
      id: validId,
      build_id: validBuildId,
      module_id: validModuleId,
      t_scenario_id: validScenarioId,
      requirement_id: validRequirementId,
      t_name: 'Nome completo atualizado',
      summary: 'Resumo completo atualizado',
      t_pre_condition: 'Pré-condição',
      t_associated_steps: 'Passos detalhados',
      t_expected_result: 'Resultado esperado',
      t_post_condition: 'Pós-condição',
      t_execution_type: 'automated',
      t_testing_type: 'Regression',
      t_priority: 'High',
      t_comments: 'Comentário de atualização',
      t_status: 'active',
      t_approved: 1,
      t_reviewed: 2,
      approved_by: 'analista'
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.body).to.have.property('success');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code is 400, 401, 403', () => {
    testCaseUpdate({
      project_id: validProjectId,
      id: validId,
      t_name: 'Nome',
      summary: 'Resumo',
      t_execution_type: 'manual',
      t_testing_type: 'Functional',
      t_priority: 'Low'
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code is 200', () => {
    testCaseUpdate({
      token: validToken,
      project_id: validProjectId,
      id: validId,
      t_name: 'Nome',
      summary: 'Resumo',
      t_execution_type: 'manual',
      t_testing_type: 'Functional',
      t_priority: 'Low',
      foo: 'bar'
    }).then(response => {
      expect([200, 400]).to.include(response.status);
    });
  });

  it('Status Code is 400, 415', () => {
    cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      body: {
        token: validToken,
        project_id: validProjectId,
        id: validId,
        t_name: 'Nome',
        summary: 'Resumo',
        t_execution_type: 'manual',
        t_testing_type: 'Functional',
        t_priority: 'Low'
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    testCaseUpdate({
      token: "' OR 1=1 --",
      project_id: validProjectId,
      id: validId,
      t_name: 'Nome',
      summary: 'Resumo',
      t_execution_type: 'manual',
      t_testing_type: 'Functional',
      t_priority: 'Low'
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  it('Headers devem conter CORS e content-type', () => {
    testCaseUpdate({
      token: validToken,
      project_id: validProjectId,
      id: validId,
      t_name: 'Nome',
      summary: 'Resumo',
      t_execution_type: 'manual',
      t_testing_type: 'Functional',
      t_priority: 'Low'
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      testCaseUpdate({
        token: validToken,
        project_id: validProjectId,
        id: validId,
        t_name: 'Nome',
        summary: 'Resumo',
        t_execution_type: 'manual',
        t_testing_type: 'Functional',
        t_priority: 'Low'
      })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  it('Status Code is 200, 400, 401, 409', () => {
    testCaseUpdate({
      token: validToken,
      project_id: validProjectId,
      id: validId,
      t_name: 'Nome',
      summary: 'Resumo',
      t_execution_type: 'manual',
      t_testing_type: 'Functional',
      t_priority: 'Low'
    })
      .then(() => testCaseUpdate({
        token: validToken,
        project_id: validProjectId,
        id: validId,
        t_name: 'Nome',
        summary: 'Resumo',
        t_execution_type: 'manual',
        t_testing_type: 'Functional',
        t_priority: 'Low'
      }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });
});