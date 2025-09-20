// Testes automatizados para API: POST /report/defects
// Segue o padrão completo do exemplo fornecido, cobrindo todos os cenários possíveis, inclusive exportação.

describe('API - Report Defects - /report/defects', () => {
  const validToken = 'token_valido_aqui';
  const validProjectId = 77;

  function reportDefects(body, options = {}) {
    return cy.request({
      method: 'POST',
      url: `${BASE_URL}/Report/defects`,
      form: true,
      body,
      failOnStatusCode: false,
      ...options,
    });
  }

  // --- POSITIVO (mínimo) ---
  it('Retorna lista de defeitos com token e project_id válidos', () => {
    reportDefects({ token: validToken, project_id: validProjectId }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.exist;
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- POSITIVO: Todos filtros ---
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

  // --- NEGATIVO: Auth ---
  it('Falha sem token', () => {
    reportDefects({ project_id: validProjectId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  ['token_invalido', null, '', 12345, '😀🔥💥', "' OR 1=1 --"].forEach(token => {
    it(`Falha com token inválido (${JSON.stringify(token)})`, () => {
      reportDefects({ token, project_id: validProjectId }).then(response => {
        expect([400, 401, 403]).to.include(response.status);
      });
    });
  });

  // --- NEGATIVO: project_id inválido, ausente, tipos errados, limites ---
  it('Falha sem project_id', () => {
    reportDefects({ token: validToken }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(project_id => {
    it(`Falha com project_id inválido (${JSON.stringify(project_id)})`, () => {
      reportDefects({ token: validToken, project_id }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- NEGATIVO: Parâmetros opcionais inválidos ---
  [
    { build_id: 'abc' },
    { module_id: 'abc' },
    { test_scenario_id: 'abc' },
    { created_by: 'abc' }
  ].forEach(params => {
    it(`Falha com parâmetro opcional inválido (${JSON.stringify(params)})`, () => {
      reportDefects({ token: validToken, project_id: validProjectId, ...params }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- Exportação de dados ---
  ['CSV', 'Excel', 'Word'].forEach(export_type => {
    it(`Exporta relatório de defeitos no formato ${export_type}`, () => {
      reportDefects({
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

  // --- Campos extras ---
  it('Ignora campo extra no body', () => {
    reportDefects({ token: validToken, project_id: validProjectId, extra: 'foo' }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  // --- HTTP Method errado ---
  ['GET', 'PUT', 'DELETE', 'PATCH'].forEach(method => {
    it(`Falha com método HTTP ${method}`, () => {
      cy.request({
        method,
        url: `${BASE_URL}/Report/defects`,
        form: true,
        body: { token: validToken, project_id: validProjectId },
        failOnStatusCode: false,
      }).then(response => {
        expect([405, 404, 400]).to.include(response.status);
      });
    });
  });

  // --- Content-Type errado ---
  it('Falha com Content-Type application/json', () => {
    cy.request({
      method: 'POST',
      url: `${BASE_URL}/Report/defects`,
      body: { token: validToken, project_id: validProjectId },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  // --- Contrato: Não vazar informações sensíveis ---
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    reportDefects({ token: "' OR 1=1 --", project_id: validProjectId }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // --- Headers ---
  it('Headers devem conter CORS e content-type', () => {
    reportDefects({ token: validToken, project_id: validProjectId }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- Rate limit (se aplicável) ---
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      reportDefects({ token: validToken, project_id: validProjectId })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  // --- Duplicidade: Aceita requisições idênticas sequenciais ---
  it('Permite requisições duplicadas rapidamente', () => {
    reportDefects({ token: validToken, project_id: validProjectId })
      .then(() => reportDefects({ token: validToken, project_id: validProjectId }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });

});