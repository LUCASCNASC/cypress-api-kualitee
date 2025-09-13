describe('API - Users Delete - /users/delete', () => {
  const BASE_URL = 'https://apiss.kualitee.com/api/v2';
  const validToken = 'token_valido_aqui';

  // Ajuste para um user_id válido de seu ambiente
  const validUserId = 101;

  function deleteUser(body, options = {}) {
    return cy.request({
      method: 'POST',
      url: `${BASE_URL}/User/UsersDelete`,
      form: true,
      body,
      failOnStatusCode: false,
      ...options,
    });
  }

  // --- POSITIVOS ---
  it('Deleta usuário com token e user_id válidos', () => {
    deleteUser({ token: validToken, 'user_id[0]': validUserId }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.body).to.have.property('success', true);
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Deleta múltiplos usuários (array de user_id)', () => {
    // Use IDs válidos no seu ambiente!
    deleteUser({ token: validToken, 'user_id[0]': validUserId, 'user_id[1]': validUserId + 1 }).then(response => {
      expect([200, 400, 422]).to.include(response.status);
      // Pode ser sucesso ou erro dependendo da existência dos IDs
    });
  });

  // --- NEGATIVOS: Auth ---
  it('Falha sem token', () => {
    deleteUser({ 'user_id[0]': validUserId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
      expect(response.body).to.have.property('success', false);
    });
  });

  it('Falha com token inválido', () => {
    deleteUser({ token: 'token_invalido', 'user_id[0]': validUserId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token expirado', () => {
    deleteUser({ token: 'token_expirado', 'user_id[0]': validUserId }).then(response => {
      expect([401, 403]).to.include(response.status);
    });
  });

  it('Falha com token nulo', () => {
    deleteUser({ token: null, 'user_id[0]': validUserId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token contendo caracteres especiais', () => {
    deleteUser({ token: '😀🔥💥', 'user_id[0]': validUserId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token SQL Injection', () => {
    deleteUser({ token: "' OR 1=1 --", 'user_id[0]': validUserId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  // --- user_id inválido, ausente, não existente, tipos errados, limites ---
  it('Falha sem user_id', () => {
    deleteUser({ token: validToken }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
      expect(response.body).to.have.property('success', false);
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(user_id => {
    it(`Falha com user_id inválido (${JSON.stringify(user_id)})`, () => {
      deleteUser({ token: validToken, 'user_id[0]': user_id }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
        expect(response.body).to.have.property('success', false);
      });
    });
  });

  it('Falha com user_id inexistente', () => {
    deleteUser({ token: validToken, 'user_id[0]': 999999 }).then(response => {
      expect([404, 422, 400]).to.include(response.status);
    });
  });

  // --- Campos extras ---
  it('Ignora campo extra no body', () => {
    deleteUser({ token: validToken, 'user_id[0]': validUserId, extra: 'foo' }).then(response => {
      expect([200, 400, 422]).to.include(response.status);
    });
  });

  // --- HTTP Method errado ---
  ['GET', 'PUT', 'DELETE', 'PATCH'].forEach(method => {
    it(`Falha com método HTTP ${method}`, () => {
      cy.request({
        method,
        url: `${BASE_URL}/User/UsersDelete`,
        form: true,
        body: { token: validToken, 'user_id[0]': validUserId },
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
      url: `${BASE_URL}/User/UsersDelete`,
      body: { token: validToken, 'user_id[0]': validUserId },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  // --- Contrato: Não vazar informações sensíveis ---
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    deleteUser({ token: "' OR 1=1 --", 'user_id[0]': validUserId }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // --- Headers ---
  it('Headers devem conter CORS e content-type', () => {
    deleteUser({ token: validToken, 'user_id[0]': validUserId }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- Rate limit (se aplicável) ---
  it('Falha após múltiplas deleções rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      deleteUser({ token: validToken, 'user_id[0]': validUserId })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  // --- Duplicidade: Aceita deleções idênticas sequenciais ---
  it('Permite deleções duplicadas rapidamente (idempotência)', () => {
    deleteUser({ token: validToken, 'user_id[0]': validUserId })
      .then(() => deleteUser({ token: validToken, 'user_id[0]': validUserId }))
      .then((response) => {
        expect([200, 400, 401, 409, 422, 404]).to.include(response.status);
      });
  });

});