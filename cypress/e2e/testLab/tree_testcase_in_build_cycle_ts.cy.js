// Testes automatizados para API: POST /manage_test_case/tree_testcase_in_build_cycle_ts
// Segue o padrão do arquivo de exemplo fornecido (update.cy.js)
const PATH_API = '/TestLab/TreeTestCaseinBuildcycletestScenario'

describe('API - Manage Test Case Tree Testcase In Build Cycle Test Scenario - /manage_test_case/tree_testcase_in_build_cycle_ts', () => {
  const validToken = 'token_valido_aqui';
  const validProjectId = 77;
  const validCycleId = 1001;
  const validTestScenarioId = 1234;

  function treeTestcaseInBuildCycleTs(body, options = {}) {
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
  it('Consulta casos de teste de cenário do ciclo do build com todos os campos obrigatórios válidos', () => {
    treeTestcaseInBuildCycleTs({
      token: validToken,
      project_id: validProjectId,
      cycle_id: validCycleId,
      test_scenario_id: validTestScenarioId
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- NEGATIVO: Auth ---
  it('Falha sem token', () => {
    treeTestcaseInBuildCycleTs({
      project_id: validProjectId,
      cycle_id: validCycleId,
      test_scenario_id: validTestScenarioId
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  ['token_invalido', null, '', 12345].forEach(token => {
    it(`Falha com token inválido (${JSON.stringify(token)})`, () => {
      treeTestcaseInBuildCycleTs({
        token,
        project_id: validProjectId,
        cycle_id: validCycleId,
        test_scenario_id: validTestScenarioId
      }).then(response => {
        expect([400, 401, 403]).to.include(response.status);
      });
    });
  });

  // --- Campos obrigatórios ausentes ---
  ['project_id', 'cycle_id', 'test_scenario_id'].forEach(field => {
    it(`Falha sem campo obrigatório ${field}`, () => {
      const body = {
        token: validToken,
        project_id: validProjectId,
        cycle_id: validCycleId,
        test_scenario_id: validTestScenarioId
      };
      delete body[field];
      treeTestcaseInBuildCycleTs(body).then(response => {
        expect([400, 422]).to.include(response.status);
      });
    });
  });

  // --- Campos obrigatórios inválidos ---
  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(project_id => {
    it(`Falha com project_id inválido (${JSON.stringify(project_id)})`, () => {
      treeTestcaseInBuildCycleTs({
        token: validToken,
        project_id,
        cycle_id: validCycleId,
        test_scenario_id: validTestScenarioId
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(cycle_id => {
    it(`Falha com cycle_id inválido (${JSON.stringify(cycle_id)})`, () => {
      treeTestcaseInBuildCycleTs({
        token: validToken,
        project_id: validProjectId,
        cycle_id,
        test_scenario_id: validTestScenarioId
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(test_scenario_id => {
    it(`Falha com test_scenario_id inválido (${JSON.stringify(test_scenario_id)})`, () => {
      treeTestcaseInBuildCycleTs({
        token: validToken,
        project_id: validProjectId,
        cycle_id: validCycleId,
        test_scenario_id
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- Campos extras ---
  it('Ignora campo extra no body', () => {
    treeTestcaseInBuildCycleTs({
      token: validToken,
      project_id: validProjectId,
      cycle_id: validCycleId,
      test_scenario_id: validTestScenarioId,
      foo: 'bar'
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
          cycle_id: validCycleId,
          test_scenario_id: validTestScenarioId
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
        cycle_id: validCycleId,
        test_scenario_id: validTestScenarioId
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  // --- Contrato: Não vazar informações sensíveis ---
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    treeTestcaseInBuildCycleTs({
      token: "' OR 1=1 --",
      project_id: validProjectId,
      cycle_id: validCycleId,
      test_scenario_id: validTestScenarioId
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // --- Headers ---
  it('Headers devem conter CORS e content-type', () => {
    treeTestcaseInBuildCycleTs({
      token: validToken,
      project_id: validProjectId,
      cycle_id: validCycleId,
      test_scenario_id: validTestScenarioId
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- Rate limit (se aplicável) ---
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      treeTestcaseInBuildCycleTs({
        token: validToken,
        project_id: validProjectId,
        cycle_id: validCycleId,
        test_scenario_id: validTestScenarioId
      })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  // --- Duplicidade: Aceita requisições idênticas sequenciais ---
  it('Permite requisições duplicadas rapidamente', () => {
    treeTestcaseInBuildCycleTs({
      token: validToken,
      project_id: validProjectId,
      cycle_id: validCycleId,
      test_scenario_id: validTestScenarioId
    }).then(() =>
      treeTestcaseInBuildCycleTs({
        token: validToken,
        project_id: validProjectId,
        cycle_id: validCycleId,
        test_scenario_id: validTestScenarioId
      })
    ).then((response) => {
      expect([200, 400, 401, 409]).to.include(response.status);
    });
  });

});