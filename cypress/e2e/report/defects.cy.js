const PATH_API = '/Report/defects';
const validToken = Cypress.env('VALID_TOKEN');

const validProjectId = 77;

describe('API rest - Report Defects - /report/defects', () => {

  it('Status Code is 200', () => {
    reportDefects({ token: validToken, project_id: validProjectId }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.exist;
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Retorna lista de defeitos usando todos os filtros possíveis', () => {
    reportDefects({
      token: validToken,
      project_id: validProjectId,
      build_id: 1,
      module_id: 1,
      test_scenario_id: 1,
      os: 'Windows',
      browser: 'Chrome',
      assignto: 'tester',
      created_by: 2,
      severity: 'Critical',
      bugtype: 'Functional',
      priority: 'High',
      status: 'Open',
      from_date: '2025-01-01',
      to_date: '2025-12-31',
      status_from: 'Open',
      status_to: 'Closed',
      export: 'yes',
      export_type: 'CSV',
      advance_search: [
        '1234', 'Critical', 'High', 'Windows', 'Chrome', 'desc', 'cycle1', 
        'repro steps', 'aresult', 'eresult', 'comments', 'Open', '2025-01-01', 'img', '5678'
      ]
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.exist;
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Falha sem token', () => {
    reportDefects({ project_id: validProjectId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha sem project_id', () => {
    reportDefects({ token: validToken }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Ignora campo extra no body', () => {
    reportDefects({ token: validToken, project_id: validProjectId, extra: 'foo' }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  it('Falha com Content-Type application/json', () => {
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
    reportDefects({ token: "' OR 1=1 --", project_id: validProjectId }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  it('Headers devem conter CORS e content-type', () => {
    reportDefects({ token: validToken, project_id: validProjectId }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      reportDefects({ token: validToken, project_id: validProjectId })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  it('Permite requisições duplicadas rapidamente', () => {
    reportDefects({ token: validToken, project_id: validProjectId })
      .then(() => reportDefects({ token: validToken, project_id: validProjectId }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });
});