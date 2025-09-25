describe('API - User Detail - /users/detail', () => {

  // Ajuste para um user_id válido de seu ambiente
  const validUserId = 101;

  function getUserDetail(params, options = {}) {
    return cy.request({
      method: 'GET',
      url: '/User/UserDetail',
      qs: params,
      failOnStatusCode: false,
      ...options,
    });
  }

  // --- POSITIVOS ---
  it('Retorna detalhes do usuário com token e user_id válidos', () => {
    getUserDetail({ token: validToken, user_id: validUserId }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.body).to.have.property('success', true);
      expect(response.headers['content-type']).to.include('application/json');
      // Validação de contrato básica (ajuste conforme response real)
      expect(response.body).to.have.property('user').that.is.an('object');
    });
  });

  // --- NEGATIVOS: Token inválido, ausente, expirado, nulo, caracteres especiais, SQLi ---
  it('Falha sem token', () => {
    getUserDetail({ user_id: validUserId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
      expect(response.body).to.have.property('success', false);
    });
  });

  it('Falha com token inválido', () => {
    getUserDetail({ token: 'token_invalido', user_id: validUserId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token expirado', () => {
    getUserDetail({ token: 'token_expirado', user_id: validUserId }).then(response => {
      expect([401, 403]).to.include(response.status);
    });
  });

  it('Falha com token nulo', () => {
    getUserDetail({ token: null, user_id: validUserId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token contendo caracteres especiais', () => {
    getUserDetail({ token: '😀🔥💥', user_id: validUserId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token SQL Injection', () => {
    getUserDetail({ token: "' OR 1=1 --", user_id: validUserId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  // --- NEGATIVOS: user_id inválido, ausente, não existente, tipos errados, limites ---
  it('Falha sem user_id', () => {
    getUserDetail({ token: validToken }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
      expect(response.body).to.have.property('success', false);
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(user_id => {
    it(`Falha com user_id inválido (${JSON.stringify(user_id)})`, () => {
      getUserDetail({ token: validToken, user_id }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
        expect(response.body).to.have.property('success', false);
      });
    });
  });

  it('Falha com user_id inexistente', () => {
    getUserDetail({ token: validToken, user_id: 999999 }).then(response => {
      expect([404, 422, 400]).to.include(response.status);
    });
  });

  // --- Campos extras ---
  it('Ignora campo extra na query', () => {
    getUserDetail({ token: validToken, user_id: validUserId, extra: 'foo' }).then(response => {
      expect([200, 400, 422]).to.include(response.status);
    });
  });

  // --- HTTP Method errado ---
  ['POST', 'PUT', 'DELETE', 'PATCH'].forEach(method => {
    it(`Falha com método HTTP ${method}`, () => {
      cy.request({
        method,
        url: '/User/UserDetail',
        qs: { token: validToken, user_id: validUserId },
        failOnStatusCode: false,
      }).then(response => {
        expect([405, 404, 400]).to.include(response.status);
      });
    });
  });

  // --- Content-Type errado (GET não envia body, mas pode forçar header) ---
  it('Falha com Content-Type application/x-www-form-urlencoded', () => {
    cy.request({
      method: 'GET',
      url: '/User/UserDetail',
      qs: { token: validToken, user_id: validUserId },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      failOnStatusCode: false
    }).then((response) => {
      expect([200, 400, 415]).to.include(response.status);
    });
  });

  // --- Contrato: Não vazar informações sensíveis ---
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    getUserDetail({ token: "' OR 1=1 --", user_id: validUserId }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // --- Headers ---
  it('Headers devem conter CORS e content-type', () => {
    getUserDetail({ token: validToken, user_id: validUserId }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- Rate limit (se aplicável) ---
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      getUserDetail({ token: validToken, user_id: validUserId })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  // --- Duplicidade: Aceita requisições idênticas sequenciais ---
  it('Permite requisições duplicadas rapidamente', () => {
    getUserDetail({ token: validToken, user_id: validUserId })
      .then(() => getUserDetail({ token: validToken, user_id: validUserId }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });

});