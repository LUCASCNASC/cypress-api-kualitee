// Testes automatizados para API: POST /report/test_case_execution
// Padrão completo conforme exemplos anteriores, cobrindo todos os cenários possíveis, inclusive exportação e busca avançada.

describe('API - Report Test Case Execution - /report/test_case_execution', () => {
  const BASE_URL = 'https://apiss.kualitee.com/api/v2';
  const validToken = 'token_valido_aqui';
  const validProjectId = 77;

  function reportTestCaseExecution(body, options = {}) {
    return cy.request({
      method: 'POST',
      url: `${BASE_URL}/Report/TestCaseExecution`,
      form: true,
      body,
      failOnStatusCode: false,
      ...options,
    });
  }

  // --- POSITIVO (mínimo) ---
  it('Retorna relatório de execução de testes com token e project_id válidos', () => {
    reportTestCaseExecution({ token: validToken, project_id: validProjectId }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.exist;
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- POSITIVO: Todos filtros ---
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

  // --- NEGATIVO: Auth ---
  it('Falha sem token', () => {
    reportTestCaseExecution({ project_id: validProjectId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  ['token_invalido', null, '', 12345, '😀🔥💥', "' OR 1=1 --"].forEach(token => {
    it(`Falha com token inválido (${JSON.stringify(token)})`, () => {
      reportTestCaseExecution({ token, project_id: validProjectId }).then(response => {
        expect([400, 401, 403]).to.include(response.status);
      });
    });
  });

  // --- NEGATIVO: project_id inválido, ausente, tipos errados, limites ---
  it('Falha sem project_id', () => {
    reportTestCaseExecution({ token: validToken }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(project_id => {
    it(`Falha com project_id inválido (${JSON.stringify(project_id)})`, () => {
      reportTestCaseExecution({ token: validToken, project_id }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- NEGATIVO: Parâmetros opcionais inválidos ---
  [
    { tester_id: 'abc' },
    { created_by: 'abc' }
  ].forEach(params => {
    it(`Falha com parâmetro opcional inválido (${JSON.stringify(params)})`, () => {
      reportTestCaseExecution({ token: validToken, project_id: validProjectId, ...params }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- Exportação de dados ---
  ['CSV', 'Excel', 'Word'].forEach(export_type => {
    it(`Exporta relatório de execução de testes no formato ${export_type}`, () => {
      reportTestCaseExecution({
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
    reportTestCaseExecution({ token: validToken, project_id: validProjectId, extra: 'foo' }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  // --- HTTP Method errado ---
  ['GET', 'PUT', 'DELETE', 'PATCH'].forEach(method => {
    it(`Falha com método HTTP ${method}`, () => {
      cy.request({
        method,
        url: `${BASE_URL}/Report/TestCaseExecution`,
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
      url: `${BASE_URL}/Report/TestCaseExecution`,
      body: { token: validToken, project_id: validProjectId },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  // --- Contrato: Não vazar informações sensíveis ---
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    reportTestCaseExecution({ token: "' OR 1=1 --", project_id: validProjectId }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // --- Headers ---
  it('Headers devem conter CORS e content-type', () => {
    reportTestCaseExecution({ token: validToken, project_id: validProjectId }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- Rate limit (se aplicável) ---
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      reportTestCaseExecution({ token: validToken, project_id: validProjectId })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  // --- Duplicidade: Aceita requisições idênticas sequenciais ---
  it('Permite requisições duplicadas rapidamente', () => {
    reportTestCaseExecution({ token: validToken, project_id: validProjectId })
      .then(() => reportTestCaseExecution({ token: validToken, project_id: validProjectId }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });

});