describe('API - Update Password - /update_password', () => {
  const BASE_URL = 'https://apiss.kualitee.com/api/v2';

  // Dados base válidos (ajuste para valores válidos em seu ambiente, se necessário)
  const validBody = {
    activated_tenant_id: 'tenant123',
    activated_user_email: 'user'+Date.now()+'@test.com',
    users_c_password: 'SenhaAtual@123',
    users_password: 'NovaSenha@123',
    activated_user_id: '101'
  };

  function updatePassword(body, options = {}) {
    return cy.request({
      method: 'POST',
      url: `${BASE_URL}/User/UpdatePassword`,
      form: true,
      body,
      failOnStatusCode: false,
      ...options,
    });
  }

  // --- POSITIVOS ---
  it('Atualiza senha com todos os campos válidos', () => {
    updatePassword({ ...validBody, activated_user_email: 'user'+Date.now()+'@test.com' }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.body).to.have.property('success', true);
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- NEGATIVOS: Campos obrigatórios ausentes ---
  Object.keys(validBody).forEach(field => {
    it(`Falha com campo obrigatório ausente: ${field}`, () => {
      const body = { ...validBody };
      delete body[field];
      updatePassword(body).then(response => {
        expect([400, 422]).to.include(response.status);
        expect(response.body).to.have.property('success', false);
      });
    });
  });

  // --- Emails inválidos ---
  ['lucas', 'lucas@', '@gmail.com', 'lucas.com', '', null, 123, {}, [], true, false].forEach(email => {
    it(`Falha com activated_user_email inválido (${JSON.stringify(email)})`, () => {
      updatePassword({ ...validBody, activated_user_email: email }).then(response => {
        expect([400, 422]).to.include(response.status);
        expect(response.body).to.have.property('success', false);
      });
    });
  });

  // --- activated_tenant_id inválido ---
  [null, '', {}, [], 123, true, false].forEach(tenant_id => {
    it(`Falha com activated_tenant_id inválido (${JSON.stringify(tenant_id)})`, () => {
      updatePassword({ ...validBody, activated_tenant_id: tenant_id }).then(response => {
        expect([400, 422]).to.include(response.status);
        expect(response.body).to.have.property('success', false);
      });
    });
  });

  // --- activated_user_id inválido ---
  [null, '', {}, [], true, false].forEach(user_id => {
    it(`Falha com activated_user_id inválido (${JSON.stringify(user_id)})`, () => {
      updatePassword({ ...validBody, activated_user_id: user_id }).then(response => {
        expect([400, 422]).to.include(response.status);
        expect(response.body).to.have.property('success', false);
      });
    });
  });

  // --- Senhas inválidas ---
  ['', null, {}, [], true, false].forEach(password => {
    it(`Falha com users_password inválido (${JSON.stringify(password)})`, () => {
      updatePassword({ ...validBody, users_password: password }).then(response => {
        expect([400, 422]).to.include(response.status);
        expect(response.body).to.have.property('success', false);
      });
    });
    it(`Falha com users_c_password inválido (${JSON.stringify(password)})`, () => {
      updatePassword({ ...validBody, users_c_password: password }).then(response => {
        expect([400, 422]).to.include(response.status);
        expect(response.body).to.have.property('success', false);
      });
    });
  });

  // --- Senha igual à atual ---
  it('Falha ao atualizar senha para mesma senha atual', () => {
    updatePassword({ ...validBody, users_password: validBody.users_c_password }).then(response => {
      expect([400, 422]).to.include(response.status);
      expect(response.body).to.have.property('success', false);
    });
  });

  // --- Senha fraca ---
  ['123', 'senha', 'password', 'abc'].forEach(weak => {
    it(`Falha com senha fraca ("${weak}")`, () => {
      updatePassword({ ...validBody, users_password: weak }).then(response => {
        expect([400, 422]).to.include(response.status);
      });
    });
  });

  // --- Campos extras ---
  it('Ignora campo extra no body', () => {
    updatePassword({ ...validBody, extra: 'foo' }).then(response => {
      expect([200, 400, 422]).to.include(response.status);
    });
  });

  // --- HTTP Method errado ---
  ['GET', 'PUT', 'DELETE', 'PATCH'].forEach(method => {
    it(`Falha com método HTTP ${method}`, () => {
      cy.request({
        method,
        url: `${BASE_URL}/User/UpdatePassword`,
        form: true,
        body: validBody,
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
      url: `${BASE_URL}/User/UpdatePassword`,
      body: validBody,
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  // --- Contrato: Não vazar informações sensíveis ---
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    updatePassword({ ...validBody, activated_tenant_id: "' OR 1=1 --" }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // --- Headers ---
  it('Headers devem conter CORS e content-type', () => {
    updatePassword(validBody).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- Rate limit (se aplicável) ---
  it('Falha após múltiplas trocas rápidas de senha (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      updatePassword({ ...validBody, activated_user_email: 'user'+Math.random()+'@test.com' })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  // --- Duplicidade: Tentar trocar senha duas vezes seguidas ---
  it('Falha ao atualizar senha duas vezes seguidas sem login entre elas', () => {
    updatePassword(validBody)
      .then(() => updatePassword(validBody))
      .then((response) => {
        expect([200, 400, 401, 409, 422]).to.include(response.status);
      });
  });

});