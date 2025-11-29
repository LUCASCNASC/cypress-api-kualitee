const PATH_API = '/Test%20Case%20Execution/attacheddefects'
const validToken = Cypress.env('VALID_TOKEN');

const validProjectId = Cypress.env('VALID_PROJECT_ID');

const validTcId = 101;
const validTestScenarioId = 1234;
const validCycleId = 1001;
const validExecutionId = 222;
const validDefects = [555, 556];

describe('API rest - Test Case Execution Attach Defects - /test_case_execution/attach_defects', () => {
  
  function attachDefects(body, options = {}) {
    return cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      form: true,
      body,
      failOnStatusCode: false,
      ...options,
    });
  }
  
  it('Status Code 200', () => {
    attachDefects({
      token: validToken,
      project_id: validProjectId,
      tc_id: validTcId,
      testscenario_id: validTestScenarioId,
      cycle_id: validCycleId,
      execution_id: validExecutionId,
      'defects[0]': validDefects[0],
      'defects[1]': validDefects[1]
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- NEGATIVOS: Auth ---
  it('Falha sem token', () => {
    attachDefects({
      project_id: validProjectId,
      tc_id: validTcId,
      testscenario_id: validTestScenarioId,
      cycle_id: validCycleId,
      execution_id: validExecutionId,
      'defects[0]': validDefects[0],
      'defects[1]': validDefects[1]
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  ['token_invalido', null, '', 12345, '😀🔥💥', "' OR 1=1 --"].forEach(token => {
    it(`Falha com token inválido (${JSON.stringify(token)})`, () => {
      attachDefects({
        token,
        project_id: validProjectId,
        tc_id: validTcId,
        testscenario_id: validTestScenarioId,
        cycle_id: validCycleId,
        execution_id: validExecutionId,
        'defects[0]': validDefects[0],
        'defects[1]': validDefects[1]
      }).then(response => {
        expect([400, 401, 403]).to.include(response.status);
      });
    });
  });

  // --- project_id inválido, ausente, tipos errados, limites ---
  it('Falha sem project_id', () => {
    attachDefects({
      token: validToken,
      tc_id: validTcId,
      testscenario_id: validTestScenarioId,
      cycle_id: validCycleId,
      execution_id: validExecutionId,
      'defects[0]': validDefects[0],
      'defects[1]': validDefects[1]
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(project_id => {
    it(`Falha com project_id inválido (${JSON.stringify(project_id)})`, () => {
      attachDefects({
        token: validToken,
        project_id,
        tc_id: validTcId,
        testscenario_id: validTestScenarioId,
        cycle_id: validCycleId,
        execution_id: validExecutionId,
        'defects[0]': validDefects[0],
        'defects[1]': validDefects[1]
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- tc_id inválido, ausente, tipos errados, limites ---
  it('Falha sem tc_id', () => {
    attachDefects({
      token: validToken,
      project_id: validProjectId,
      testscenario_id: validTestScenarioId,
      cycle_id: validCycleId,
      execution_id: validExecutionId,
      'defects[0]': validDefects[0],
      'defects[1]': validDefects[1]
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(tc_id => {
    it(`Falha com tc_id inválido (${JSON.stringify(tc_id)})`, () => {
      attachDefects({
        token: validToken,
        project_id: validProjectId,
        tc_id,
        testscenario_id: validTestScenarioId,
        cycle_id: validCycleId,
        execution_id: validExecutionId,
        'defects[0]': validDefects[0],
        'defects[1]': validDefects[1]
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- testscenario_id inválido, ausente, tipos errados, limites ---
  it('Falha sem testscenario_id', () => {
    attachDefects({
      token: validToken,
      project_id: validProjectId,
      tc_id: validTcId,
      cycle_id: validCycleId,
      execution_id: validExecutionId,
      'defects[0]': validDefects[0],
      'defects[1]': validDefects[1]
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(testscenario_id => {
    it(`Falha com testscenario_id inválido (${JSON.stringify(testscenario_id)})`, () => {
      attachDefects({
        token: validToken,
        project_id: validProjectId,
        tc_id: validTcId,
        testscenario_id,
        cycle_id: validCycleId,
        execution_id: validExecutionId,
        'defects[0]': validDefects[0],
        'defects[1]': validDefects[1]
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- cycle_id inválido, ausente, tipos errados, limites ---
  it('Falha sem cycle_id', () => {
    attachDefects({
      token: validToken,
      project_id: validProjectId,
      tc_id: validTcId,
      testscenario_id: validTestScenarioId,
      execution_id: validExecutionId,
      'defects[0]': validDefects[0],
      'defects[1]': validDefects[1]
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(cycle_id => {
    it(`Falha com cycle_id inválido (${JSON.stringify(cycle_id)})`, () => {
      attachDefects({
        token: validToken,
        project_id: validProjectId,
        tc_id: validTcId,
        testscenario_id: validTestScenarioId,
        cycle_id,
        execution_id: validExecutionId,
        'defects[0]': validDefects[0],
        'defects[1]': validDefects[1]
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- execution_id inválido, ausente, tipos errados, limites ---
  it('Falha sem execution_id', () => {
    attachDefects({
      token: validToken,
      project_id: validProjectId,
      tc_id: validTcId,
      testscenario_id: validTestScenarioId,
      cycle_id: validCycleId,
      'defects[0]': validDefects[0],
      'defects[1]': validDefects[1]
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(execution_id => {
    it(`Falha com execution_id inválido (${JSON.stringify(execution_id)})`, () => {
      attachDefects({
        token: validToken,
        project_id: validProjectId,
        tc_id: validTcId,
        testscenario_id: validTestScenarioId,
        cycle_id: validCycleId,
        execution_id,
        'defects[0]': validDefects[0],
        'defects[1]': validDefects[1]
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- defects[X] inválidos, ausentes, tipos errados, limites ---
  ['defects[0]', 'defects[1]'].forEach(defectField => {
    it(`Falha sem ${defectField}`, () => {
      const body = {
        token: validToken,
        project_id: validProjectId,
        tc_id: validTcId,
        testscenario_id: validTestScenarioId,
        cycle_id: validCycleId,
        execution_id: validExecutionId,
        'defects[0]': validDefects[0],
        'defects[1]': validDefects[1]
      };
      delete body[defectField];
      attachDefects(body).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(defect_id => {
    it(`Falha com defect_id inválido (${JSON.stringify(defect_id)})`, () => {
      attachDefects({
        token: validToken,
        project_id: validProjectId,
        tc_id: validTcId,
        testscenario_id: validTestScenarioId,
        cycle_id: validCycleId,
        execution_id: validExecutionId,
        'defects[0]': defect_id,
        'defects[1]': validDefects[1]
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- Campos extras ---
  it('Ignora campo extra no body', () => {
    attachDefects({
      token: validToken,
      project_id: validProjectId,
      tc_id: validTcId,
      testscenario_id: validTestScenarioId,
      cycle_id: validCycleId,
      execution_id: validExecutionId,
      'defects[0]': validDefects[0],
      'defects[1]': validDefects[1],
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
          execution_id: validExecutionId,
          'defects[0]': validDefects[0],
          'defects[1]': validDefects[1]
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
        execution_id: validExecutionId,
        'defects[0]': validDefects[0],
        'defects[1]': validDefects[1]
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  // --- Contrato: Não vazar informações sensíveis ---
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    attachDefects({
      token: "' OR 1=1 --",
      project_id: validProjectId,
      tc_id: validTcId,
      testscenario_id: validTestScenarioId,
      cycle_id: validCycleId,
      execution_id: validExecutionId,
      'defects[0]': validDefects[0],
      'defects[1]': validDefects[1]
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // --- Headers ---
  it('Headers devem conter CORS e content-type', () => {
    attachDefects({
      token: validToken,
      project_id: validProjectId,
      tc_id: validTcId,
      testscenario_id: validTestScenarioId,
      cycle_id: validCycleId,
      execution_id: validExecutionId,
      'defects[0]': validDefects[0],
      'defects[1]': validDefects[1]
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- Rate limit (se aplicável) ---
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      attachDefects({
        token: validToken,
        project_id: validProjectId,
        tc_id: validTcId,
        testscenario_id: validTestScenarioId,
        cycle_id: validCycleId,
        execution_id: validExecutionId,
        'defects[0]': validDefects[0],
        'defects[1]': validDefects[1]
      })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  // --- Duplicidade: Aceita requisições idênticas sequenciais ---
  it('Permite requisições duplicadas rapidamente', () => {
    attachDefects({
      token: validToken,
      project_id: validProjectId,
      tc_id: validTcId,
      testscenario_id: validTestScenarioId,
      cycle_id: validCycleId,
      execution_id: validExecutionId,
      'defects[0]': validDefects[0],
      'defects[1]': validDefects[1]
    })
      .then(() => attachDefects({
        token: validToken,
        project_id: validProjectId,
        tc_id: validTcId,
        testscenario_id: validTestScenarioId,
        cycle_id: validCycleId,
        execution_id: validExecutionId,
        'defects[0]': validDefects[0],
        'defects[1]': validDefects[1]
      }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });

});