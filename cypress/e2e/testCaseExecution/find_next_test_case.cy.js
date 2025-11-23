const PATH_API = '/Test%20Case%20Execution/FindNextTestcase'
const validToken = Cypress.env('VALID_TOKEN');

const validTcId = 101;
const validTestScenarioId = 1234;
const validCycleId = 1001;
const validBuildId = Cypress.env('VALID_BUILD_ID');
const validOffsetTestExecutions = 0;
const validProjectId = Cypress.env('VALID_PROJECT_ID');

describe('API - Test Case Execution Find Next Test Case - /test_case_execution/find_next_test_case', () => {
  
  function findNextTestCase(body, options = {}) {
    return cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      form: true,
      body,
      failOnStatusCode: false,
      ...options,
    });
  }

  // --- POSITIVO ---
  it('Retorna próximo test case com todos os campos obrigatórios válidos', () => {
    findNextTestCase({
      token: validToken,
      project_id: validProjectId,
      tc_id: validTcId,
      testscenario_id: validTestScenarioId,
      cycle_id: validCycleId,
      build_id: validBuildId,
      offset_test_executions: validOffsetTestExecutions
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- NEGATIVOS: Auth ---
  it('Falha sem token', () => {
    findNextTestCase({
      project_id: validProjectId,
      tc_id: validTcId,
      testscenario_id: validTestScenarioId,
      cycle_id: validCycleId,
      build_id: validBuildId,
      offset_test_executions: validOffsetTestExecutions
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  ['token_invalido', null, '', 12345, '😀🔥💥', "' OR 1=1 --"].forEach(token => {
    it(`Falha com token inválido (${JSON.stringify(token)})`, () => {
      findNextTestCase({
        token,
        project_id: validProjectId,
        tc_id: validTcId,
        testscenario_id: validTestScenarioId,
        cycle_id: validCycleId,
        build_id: validBuildId,
        offset_test_executions: validOffsetTestExecutions
      }).then(response => {
        expect([400, 401, 403]).to.include(response.status);
      });
    });
  });

  // --- project_id inválido, ausente, tipos errados, limites ---
  it('Falha sem project_id', () => {
    findNextTestCase({
      token: validToken,
      tc_id: validTcId,
      testscenario_id: validTestScenarioId,
      cycle_id: validCycleId,
      build_id: validBuildId,
      offset_test_executions: validOffsetTestExecutions
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(project_id => {
    it(`Falha com project_id inválido (${JSON.stringify(project_id)})`, () => {
      findNextTestCase({
        token: validToken,
        project_id,
        tc_id: validTcId,
        testscenario_id: validTestScenarioId,
        cycle_id: validCycleId,
        build_id: validBuildId,
        offset_test_executions: validOffsetTestExecutions
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- tc_id inválido, ausente, tipos errados, limites ---
  it('Falha sem tc_id', () => {
    findNextTestCase({
      token: validToken,
      project_id: validProjectId,
      testscenario_id: validTestScenarioId,
      cycle_id: validCycleId,
      build_id: validBuildId,
      offset_test_executions: validOffsetTestExecutions
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(tc_id => {
    it(`Falha com tc_id inválido (${JSON.stringify(tc_id)})`, () => {
      findNextTestCase({
        token: validToken,
        project_id: validProjectId,
        tc_id,
        testscenario_id: validTestScenarioId,
        cycle_id: validCycleId,
        build_id: validBuildId,
        offset_test_executions: validOffsetTestExecutions
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- testscenario_id inválido, ausente, tipos errados, limites ---
  it('Falha sem testscenario_id', () => {
    findNextTestCase({
      token: validToken,
      project_id: validProjectId,
      tc_id: validTcId,
      cycle_id: validCycleId,
      build_id: validBuildId,
      offset_test_executions: validOffsetTestExecutions
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(testscenario_id => {
    it(`Falha com testscenario_id inválido (${JSON.stringify(testscenario_id)})`, () => {
      findNextTestCase({
        token: validToken,
        project_id: validProjectId,
        tc_id: validTcId,
        testscenario_id,
        cycle_id: validCycleId,
        build_id: validBuildId,
        offset_test_executions: validOffsetTestExecutions
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- cycle_id inválido, ausente, tipos errados, limites ---
  it('Falha sem cycle_id', () => {
    findNextTestCase({
      token: validToken,
      project_id: validProjectId,
      tc_id: validTcId,
      testscenario_id: validTestScenarioId,
      build_id: validBuildId,
      offset_test_executions: validOffsetTestExecutions
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(cycle_id => {
    it(`Falha com cycle_id inválido (${JSON.stringify(cycle_id)})`, () => {
      findNextTestCase({
        token: validToken,
        project_id: validProjectId,
        tc_id: validTcId,
        testscenario_id: validTestScenarioId,
        cycle_id,
        build_id: validBuildId,
        offset_test_executions: validOffsetTestExecutions
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- build_id inválido, ausente, tipos errados, limites ---
  it('Falha sem build_id', () => {
    findNextTestCase({
      token: validToken,
      project_id: validProjectId,
      tc_id: validTcId,
      testscenario_id: validTestScenarioId,
      cycle_id: validCycleId,
      offset_test_executions: validOffsetTestExecutions
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  [null, '', 'abc', -1, 999999999, {}, [], true, false].forEach(build_id => {
    it(`Falha com build_id inválido (${JSON.stringify(build_id)})`, () => {
      findNextTestCase({
        token: validToken,
        project_id: validProjectId,
        tc_id: validTcId,
        testscenario_id: validTestScenarioId,
        cycle_id: validCycleId,
        build_id,
        offset_test_executions: validOffsetTestExecutions
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- offset_test_executions inválido, ausente, tipos errados, limites ---
  it('Falha sem offset_test_executions', () => {
    findNextTestCase({
      token: validToken,
      project_id: validProjectId,
      tc_id: validTcId,
      testscenario_id: validTestScenarioId,
      cycle_id: validCycleId,
      build_id: validBuildId
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  [null, '', 'abc', -1, 999999999, {}, [], true, false].forEach(offset_test_executions => {
    it(`Falha com offset_test_executions inválido (${JSON.stringify(offset_test_executions)})`, () => {
      findNextTestCase({
        token: validToken,
        project_id: validProjectId,
        tc_id: validTcId,
        testscenario_id: validTestScenarioId,
        cycle_id: validCycleId,
        build_id: validBuildId,
        offset_test_executions
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- Campos extras ---
  it('Ignora campo extra no body', () => {
    findNextTestCase({
      token: validToken,
      project_id: validProjectId,
      tc_id: validTcId,
      testscenario_id: validTestScenarioId,
      cycle_id: validCycleId,
      build_id: validBuildId,
      offset_test_executions: validOffsetTestExecutions,
      extra: 'foo'
    }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  // --- HTTP Method errado ---
  ['GET', 'PUT', 'DELETE', 'PATCH'].forEach(method => {
    it(`Falha com método HTTP ${method}`, () => {
      cy.request({
        method,
        url: `/${PATH_API}`,
        form: true,
        body: {
          token: validToken,
          project_id: validProjectId,
          tc_id: validTcId,
          testscenario_id: validTestScenarioId,
          cycle_id: validCycleId,
          build_id: validBuildId,
          offset_test_executions: validOffsetTestExecutions
        },
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
      url: `/${PATH_API}`,
      body: {
        token: validToken,
        project_id: validProjectId,
        tc_id: validTcId,
        testscenario_id: validTestScenarioId,
        cycle_id: validCycleId,
        build_id: validBuildId,
        offset_test_executions: validOffsetTestExecutions
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  // --- Contrato: Não vazar informações sensíveis ---
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    findNextTestCase({
      token: "' OR 1=1 --",
      project_id: validProjectId,
      tc_id: validTcId,
      testscenario_id: validTestScenarioId,
      cycle_id: validCycleId,
      build_id: validBuildId,
      offset_test_executions: validOffsetTestExecutions
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // --- Headers ---
  it('Headers devem conter CORS e content-type', () => {
    findNextTestCase({
      token: validToken,
      project_id: validProjectId,
      tc_id: validTcId,
      testscenario_id: validTestScenarioId,
      cycle_id: validCycleId,
      build_id: validBuildId,
      offset_test_executions: validOffsetTestExecutions
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- Rate limit (se aplicável) ---
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      findNextTestCase({
        token: validToken,
        project_id: validProjectId,
        tc_id: validTcId,
        testscenario_id: validTestScenarioId,
        cycle_id: validCycleId,
        build_id: validBuildId,
        offset_test_executions: validOffsetTestExecutions
      })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  // --- Duplicidade: Aceita requisições idênticas sequenciais ---
  it('Permite requisições duplicadas rapidamente', () => {
    findNextTestCase({
      token: validToken,
      project_id: validProjectId,
      tc_id: validTcId,
      testscenario_id: validTestScenarioId,
      cycle_id: validCycleId,
      build_id: validBuildId,
      offset_test_executions: validOffsetTestExecutions
    })
      .then(() => findNextTestCase({
        token: validToken,
        project_id: validProjectId,
        tc_id: validTcId,
        testscenario_id: validTestScenarioId,
        cycle_id: validCycleId,
        build_id: validBuildId,
        offset_test_executions: validOffsetTestExecutions
      }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });

});