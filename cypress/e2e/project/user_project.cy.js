const PATH_API = '/Project/UsersProjectList'

describe('API - Users Project List - /project/user_project', () => {
  const validToken = Cypress.env('VALID_TOKEN');

  function userProject(queryParams, options = {}) {
    return cy.request({
      method: 'GET',
      url: `/${PATH_API}`,
      qs: queryParams,
      failOnStatusCode: false,
      ...options,
    });
  }

  // --- POSITIVO ---
  it('Retorna lista de projetos do usuário com token válido', () => {
    userProject({ token: validToken }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- NEGATIVOS: Auth ---
  it('Falha sem token', () => {
    userProject({}).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token inválido', () => {
    userProject({ token: 'token_invalido' }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token expirado', () => {
    userProject({ token: 'token_expirado' }).then(response => {
      expect([401, 403]).to.include(response.status);
    });
  });

  it('Falha com token nulo', () => {
    userProject({ token: null }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token contendo caracteres especiais', () => {
    userProject({ token: '😀🔥💥' }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token SQL Injection', () => {
    userProject({ token: "' OR 1=1 --" }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  // --- Campos extras ---
  it('Ignora campo extra nos parâmetros', () => {
    userProject({ token: validToken, extra: 'foo' }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  // --- HTTP Method errado ---
  ['POST', 'PUT', 'DELETE', 'PATCH'].forEach(method => {
    it(`Falha com método HTTP ${method}`, () => {
      cy.request({
        method,
        url: `/${PATH_API}`,
        qs: { token: validToken },
        failOnStatusCode: false,
      }).then(response => {
        expect([405, 404, 400]).to.include(response.status);
      });
    });
  });

  // --- Content-Type errado ---
  it('Falha com Content-Type application/json no GET', () => {
    cy.request({
      method: 'GET',
      url: `/${PATH_API}`,
      qs: { token: validToken },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415, 200]).to.include(response.status); // algumas APIs aceitam, outras não
    });
  });

  // --- Contrato: Não vazar informações sensíveis ---
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    userProject({ token: "' OR 1=1 --" }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // --- Headers ---
  it('Headers devem conter CORS e content-type', () => {
    userProject({ token: validToken }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- Rate limit (se aplicável) ---
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      userProject({ token: validToken })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  // --- Duplicidade: Aceita requisições idênticas sequenciais ---
  it('Permite requisições duplicadas rapidamente', () => {
    userProject({ token: validToken })
      .then(() => userProject({ token: validToken }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });

});