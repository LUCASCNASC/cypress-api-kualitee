const PATH_API = '/User/UsersLists'
const validToken = Cypress.env('VALID_TOKEN');

describe('API rest - Users List - /users/list', () => {

  function listUsers(body, options = {}) {
    return cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      form: true,
      body,
      failOnStatusCode: false,
      ...options,
    });
  }

  // --- POSITIVOS ---
  [0, 1, 2, undefined].forEach((status) => {
    it(`Deve retornar lista de usuários com token válido e status ${status === undefined ? 'default' : status}`, () => {
      listUsers({ token: validToken, ...(status !== undefined ? { user_status: status } : {}) }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('object');
        expect(response.headers['content-type']).to.include('application/json');
        // Validação de contrato (ajuste conforme response real)
        expect(response.body).to.have.property('success', true);
        expect(response.body).to.have.property('users').that.is.an('array');
      });
    });
  });

  // --- NEGATIVOS: Token inválido, ausente, expirado, campos inválidos ---
  it('Falha sem token', () => {
    listUsers({}).then((response) => {
      expect([400, 401, 403]).to.include(response.status);
      expect(response.body).to.have.property('success', false);
      expect(response.body).to.have.property('message');
    });
  });

  it('Falha com token inválido', () => {
    listUsers({ token: 'token_invalido' }).then((response) => {
      expect([400, 401, 403]).to.include(response.status);
      expect(response.body).to.have.property('success', false);
      expect(response.body).to.have.property('message');
    });
  });

  it('Falha com token expirado', () => {
    listUsers({ token: 'token_expirado' }).then((response) => {
      expect([401, 403]).to.include(response.status);
      expect(response.body).to.have.property('success', false);
      expect(response.body).to.have.property('message');
    });
  });

  it('Falha com token nulo', () => {
    listUsers({ token: null }).then((response) => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  // --- user_status valores inválidos ---
  [-1, 3, 999, 'a', '', null, {}, [], true, false].forEach((status) => {
    it(`Falha com user_status inválido (${JSON.stringify(status)})`, () => {
      listUsers({ token: validToken, user_status: status }).then((response) => {
        expect([400, 422]).to.include(response.status);
        expect(response.body).to.have.property('success', false);
      });
    });
  });

  // --- Campos extras ---
  it('Ignora campo extra no body', () => {
    listUsers({ token: validToken, user_status: 0, extra: 'foo' }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('success', true);
    });
  });

  // --- Campos com encoding especial, unicode, emoji ---
  it('Falha com token contendo caracteres especiais', () => {
    listUsers({ token: '😀🔥💥', user_status: 0 }).then((response) => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token SQL Injection', () => {
    listUsers({ token: "' OR 1=1 --", user_status: 0 }).then((response) => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  // --- HTTP Method errado ---
  ['GET', 'PUT', 'DELETE', 'PATCH'].forEach((method) => {
    it(`Falha com método HTTP ${method}`, () => {
      cy.request({
        method,
        url: `/${PATH_API}`,
        failOnStatusCode: false,
      }).then((response) => {
        expect([405, 404, 400]).to.include(response.status);
      });
    });
  });

  // --- Content-Type errado ---
  it('Falha com Content-Type application/json', () => {
    cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      body: { token: validToken, user_status: 0 },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  // --- Contrato: Não vazar informações sensíveis ---
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    listUsers({ token: "' OR 1=1 --", user_status: 0 }).then((response) => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // --- Headers ---
  it('Headers devem conter CORS e content-type', () => {
    listUsers({ token: validToken, user_status: 0 }).then((response) => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- Rate limit (se aplicável) ---
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() => listUsers({ token: validToken, user_status: 0 }));
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  // --- Duplicidade ---
  it('Permite requisições duplicadas rapidamente', () => {
    listUsers({ token: validToken, user_status: 0 })
      .then(() => listUsers({ token: validToken, user_status: 0 }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });

});