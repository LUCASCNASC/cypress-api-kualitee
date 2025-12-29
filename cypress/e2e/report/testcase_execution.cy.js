const PATH_API = '/Report/TestCaseExecution';
const validToken = Cypress.env('VALID_TOKEN');

const validProjectId = 77;

describe('Report Test Case Execution - /report/test_case_execution', () => {

  it('Status Code is 200', () => {
    reportTestCaseExecution({ token: validToken, project_id: validProjectId }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.exist;
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Retorna relatório de execução de testes usando todos os filtros possíveis', () => {
    reportTestCaseExecution({
      token: validToken,
      project_id: validProjectId,
      tester_id: 1,
      cycle: 'cycle1',
      status: 'Passed',
      created_by: 2,
      requirements: 'REQ-123',
      created_from: '2025-01-01',
      created_to: '2025-12-31',
      execute_from: '2025-01-01',
      execute_to: '2025-12-31',
      export: 'yes',
      export_type: 'CSV',
      advance_search: [
        'tc_name', 'summary', 'high', 'manual', 'precond', 'postcond', 'steps',
        'expected', 'is_name', 'bname', 'mname', 'cycle1', '2025-01-01', 'status', 'img',
        'execstatus', 'REQ-123', '9999', 'defect1'
      ]
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.exist;
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code is 400, 401, 403', () => {
    reportTestCaseExecution({ project_id: validProjectId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha sem project_id', () => {
    reportTestCaseExecution({ token: validToken }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Status Code is 200', () => {
    reportTestCaseExecution({ token: validToken, project_id: validProjectId, extra: 'foo' }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  it('Status Code is 400, 415', () => {
    cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      body: { token: validToken, project_id: validProjectId },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    reportTestCaseExecution({ token: "' OR 1=1 --", project_id: validProjectId }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  it('Headers devem conter CORS e content-type', () => {
    reportTestCaseExecution({ token: validToken, project_id: validProjectId }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      reportTestCaseExecution({ token: validToken, project_id: validProjectId })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  it('Status Code is 200, 400, 401, 409', () => {
    reportTestCaseExecution({ token: validToken, project_id: validProjectId })
      .then(() => reportTestCaseExecution({ token: validToken, project_id: validProjectId }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });
});