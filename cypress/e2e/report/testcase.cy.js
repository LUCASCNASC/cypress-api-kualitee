const PATH_API = '/Report/TestCase';
const validToken = Cypress.env('VALID_TOKEN');

const validProjectId = Cypress.env('VALID_PROJECT_ID');

describe('API rest - Report Testcase - /report/testcase', () => {

  function reportTestcase(body, options = {}) {
    return cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      form: true,
      body,
      failOnStatusCode: false,
      ...options,
    });
  }

  // --- POSITIVO (mínimo) ---
  it('Status Code 200', () => {
    reportTestcase({ token: validToken, project_id: validProjectId }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.exist;
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- POSITIVO: Todos filtros ---
  it('Retorna relatório de test cases usando todos os filtros possíveis', () => {
    reportTestcase({
      token: validToken,
      project_id: validProjectId,
      approved: 'yes',
      status: 'Open',
      severity: 'Critical',
      from: '2025-01-01',
      to: '2025-12-31',
      test_case_type: 'Functional',
      export: 'yes',
      export_type: 'CSV',
      advance_search: [
        'tc_name', 'summary', 'high', 'manual', 'precond', 'postcond', 'steps',
        'expected', 'is_name', 'bname', 'mname', 'cycle', '2025-01-01', 'status', 'img', 'execstatus', '9999'
      ]
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.exist;
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- NEGATIVO: Auth ---
  it('Falha sem token', () => {
    reportTestcase({ project_id: validProjectId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  ['token_invalido', null, '', 12345, '😀🔥💥', "' OR 1=1 --"].forEach(token => {
    it(`Falha com token inválido (${JSON.stringify(token)})`, () => {
      reportTestcase({ token, project_id: validProjectId }).then(response => {
        expect([400, 401, 403]).to.include(response.status);
      });
    });
  });

  // --- NEGATIVO: project_id inválido, ausente, tipos errados, limites ---
  it('Falha sem project_id', () => {
    reportTestcase({ token: validToken }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(project_id => {
    it(`Falha com project_id inválido (${JSON.stringify(project_id)})`, () => {
      reportTestcase({ token: validToken, project_id }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- NEGATIVO: Parâmetros opcionais inválidos ---
  [
    { approved: 1 },
    { status: 1 },
    { severity: 1 },
    { from: 123 },
    { to: 123 },
    { test_case_type: 1 }
  ].forEach(params => {
    it(`Falha com parâmetro opcional inválido (${JSON.stringify(params)})`, () => {
      reportTestcase({ token: validToken, project_id: validProjectId, ...params }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- Exportação de dados ---
  ['CSV', 'Excel', 'Word'].forEach(export_type => {
    it(`Exporta relatório de test cases no formato ${export_type}`, () => {
      reportTestcase({
        token: validToken,
        project_id: validProjectId,
        export: 'yes',
        export_type
      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body).to.exist;
      });
    });
  });

  
  it('Ignora campo extra no body', () => {
    reportTestcase({ token: validToken, project_id: validProjectId, extra: 'foo' }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  
  ['GET', 'PUT', 'DELETE', 'PATCH'].forEach(method => {
    it(`Falha com método HTTP ${method}`, () => {
      cy.request({
        method,
        url: `/${PATH_API}`,
        form: true,
        body: { token: validToken, project_id: validProjectId },
        failOnStatusCode: false,
      }).then(response => {
        expect([405, 404, 400]).to.include(response.status);
      });
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
    reportTestcase({ token: "' OR 1=1 --", project_id: validProjectId }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  
  it('Headers devem conter CORS e content-type', () => {
    reportTestcase({ token: validToken, project_id: validProjectId }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      reportTestcase({ token: validToken, project_id: validProjectId })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  
  it('Permite requisições duplicadas rapidamente', () => {
    reportTestcase({ token: validToken, project_id: validProjectId })
      .then(() => reportTestcase({ token: validToken, project_id: validProjectId }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });

});