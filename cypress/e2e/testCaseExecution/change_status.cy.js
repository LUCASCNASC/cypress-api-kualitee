const PATH_API = '/Test%20Case%20Execution/ChangeStatus'
const validToken = Cypress.env('VALID_TOKEN');

describe('API - Test Case Execution Change Status - /test_case_execution/change_status', () => {

  const validStatus = 'Passed';
  const validTcIds = [101, 102, 103];
  const validProjectId = Cypress.env('VALID_PROJECT_ID');

  function changeStatus(body, options = {}) {
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
  it('Altera status de múltiplos test cases com dados válidos', () => {
    changeStatus({
      token: validToken,
      project_id: validProjectId,
      status: validStatus,
      'tc_id[0]': validTcIds[0],
      'tc_id[1]': validTcIds[1],
      'tc_id[2]': validTcIds[2]
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- NEGATIVOS: Auth ---
  it('Falha sem token', () => {
    changeStatus({
      project_id: validProjectId,
      status: validStatus,
      'tc_id[0]': validTcIds[0],
      'tc_id[1]': validTcIds[1],
      'tc_id[2]': validTcIds[2]
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  ['token_invalido', null, '', 12345, '😀🔥💥', "' OR 1=1 --"].forEach(token => {
    it(`Falha com token inválido (${JSON.stringify(token)})`, () => {
      changeStatus({
        token,
        project_id: validProjectId,
        status: validStatus,
        'tc_id[0]': validTcIds[0],
        'tc_id[1]': validTcIds[1],
        'tc_id[2]': validTcIds[2]
      }).then(response => {
        expect([400, 401, 403]).to.include(response.status);
      });
    });
  });

  // --- project_id inválido, ausente, tipos errados, limites ---
  it('Falha sem project_id', () => {
    changeStatus({
      token: validToken,
      status: validStatus,
      'tc_id[0]': validTcIds[0],
      'tc_id[1]': validTcIds[1],
      'tc_id[2]': validTcIds[2]
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(project_id => {
    it(`Falha com project_id inválido (${JSON.stringify(project_id)})`, () => {
      changeStatus({
        token: validToken,
        project_id,
        status: validStatus,
        'tc_id[0]': validTcIds[0],
        'tc_id[1]': validTcIds[1],
        'tc_id[2]': validTcIds[2]
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- status inválido, ausente, tipos errados, limites ---
  it('Falha sem status', () => {
    changeStatus({
      token: validToken,
      project_id: validProjectId,
      'tc_id[0]': validTcIds[0],
      'tc_id[1]': validTcIds[1],
      'tc_id[2]': validTcIds[2]
    }).then(response => {
      expect([400, 422]).to.include(response.status);
    });
  });

  [null, '', 123, {}, [], true, false, 'INVALID_STATUS'].forEach(status => {
    it(`Falha com status inválido (${JSON.stringify(status)})`, () => {
      changeStatus({
        token: validToken,
        project_id: validProjectId,
        status,
        'tc_id[0]': validTcIds[0],
        'tc_id[1]': validTcIds[1],
        'tc_id[2]': validTcIds[2]
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- tc_id[X] inválidos, ausentes, tipos errados, limites ---
  ['tc_id[0]', 'tc_id[1]', 'tc_id[2]'].forEach(tcField => {
    it(`Falha sem ${tcField}`, () => {
      const body = {
        token: validToken,
        project_id: validProjectId,
        status: validStatus,
        'tc_id[0]': validTcIds[0],
        'tc_id[1]': validTcIds[1],
        'tc_id[2]': validTcIds[2]
      };
      delete body[tcField];
      changeStatus(body).then(response => {
        expect([400, 422]).to.include(response.status);
      });
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(tc_id => {
    it(`Falha com tc_id inválido (${JSON.stringify(tc_id)})`, () => {
      changeStatus({
        token: validToken,
        project_id: validProjectId,
        status: validStatus,
        'tc_id[0]': tc_id,
        'tc_id[1]': validTcIds[1],
        'tc_id[2]': validTcIds[2]
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- Campos extras ---
  it('Ignora campo extra no body', () => {
    changeStatus({
      token: validToken,
      project_id: validProjectId,
      status: validStatus,
      'tc_id[0]': validTcIds[0],
      'tc_id[1]': validTcIds[1],
      'tc_id[2]': validTcIds[2],
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
          status: validStatus,
          'tc_id[0]': validTcIds[0],
          'tc_id[1]': validTcIds[1],
          'tc_id[2]': validTcIds[2]
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
        status: validStatus,
        'tc_id[0]': validTcIds[0],
        'tc_id[1]': validTcIds[1],
        'tc_id[2]': validTcIds[2]
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  // --- Contrato: Não vazar informações sensíveis ---
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    changeStatus({
      token: "' OR 1=1 --",
      project_id: validProjectId,
      status: validStatus,
      'tc_id[0]': validTcIds[0],
      'tc_id[1]': validTcIds[1],
      'tc_id[2]': validTcIds[2]
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // --- Headers ---
  it('Headers devem conter CORS e content-type', () => {
    changeStatus({
      token: validToken,
      project_id: validProjectId,
      status: validStatus,
      'tc_id[0]': validTcIds[0],
      'tc_id[1]': validTcIds[1],
      'tc_id[2]': validTcIds[2]
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- Rate limit (se aplicável) ---
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      changeStatus({
        token: validToken,
        project_id: validProjectId,
        status: validStatus,
        'tc_id[0]': validTcIds[0],
        'tc_id[1]': validTcIds[1],
        'tc_id[2]': validTcIds[2]
      })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  // --- Duplicidade: Aceita requisições idênticas sequenciais ---
  it('Permite requisições duplicadas rapidamente', () => {
    changeStatus({
      token: validToken,
      project_id: validProjectId,
      status: validStatus,
      'tc_id[0]': validTcIds[0],
      'tc_id[1]': validTcIds[1],
      'tc_id[2]': validTcIds[2]
    })
      .then(() => changeStatus({
        token: validToken,
        project_id: validProjectId,
        status: validStatus,
        'tc_id[0]': validTcIds[0],
        'tc_id[1]': validTcIds[1],
        'tc_id[2]': validTcIds[2]
      }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });

});