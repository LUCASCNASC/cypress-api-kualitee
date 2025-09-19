// Testes automatizados para API: POST /roles/update

describe('API - Roles Update - /roles/update', () => {
  const validToken = 'token_valido_aqui';
  const validId = 123;
  const validRoleName = 'Papel Atualizado';
  const validDescription = 'Descrição atualizada';
  const validCanDelete = true;

  function rolesUpdate(body, options = {}) {
    return cy.request({
      method: 'POST',
      url: `${BASE_URL}/Roles/Update`,
      form: true,
      body,
      failOnStatusCode: false,
      ...options,
    });
  }

  // --- POSITIVO ---
  it('Atualiza role com token, id, role_name e description válidos', () => {
    rolesUpdate({
      token: validToken,
      id: validId,
      role_name: validRoleName,
      description: validDescription
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.exist;
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Atualiza role com can_delete true', () => {
    rolesUpdate({
      token: validToken,
      id: validId,
      role_name: validRoleName,
      description: validDescription,
      can_delete: true
    }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  it('Atualiza role com can_delete false', () => {
    rolesUpdate({
      token: validToken,
      id: validId,
      role_name: validRoleName,
      description: validDescription,
      can_delete: false
    }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  // --- NEGATIVO: Auth ---
  it('Falha sem token', () => {
    rolesUpdate({
      id: validId,
      role_name: validRoleName,
      description: validDescription
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  ['token_invalido', null, '', 12345, "' OR 1=1 --"].forEach(token => {
    it(`Falha com token inválido (${JSON.stringify(token)})`, () => {
      rolesUpdate({
        token,
        id: validId,
        role_name: validRoleName,
        description: validDescription
      }).then(response => {
        expect([400, 401, 403]).to.include(response.status);
      });
    });
  });

  // --- id inválido, ausente, tipos errados, limites ---
  it('Falha sem id', () => {
    rolesUpdate({
      token: validToken,
      role_name: validRoleName,
      description: validDescription
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(id => {
    it(`Falha com id inválido (${JSON.stringify(id)})`, () => {
      rolesUpdate({
        token: validToken,
        id,
        role_name: validRoleName,
        description: validDescription
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- role_name inválido, ausente, tipos errados, limites ---
  it('Falha sem role_name', () => {
    rolesUpdate({
      token: validToken,
      id: validId,
      description: validDescription
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  [null, '', 123, {}, [], true, false].forEach(role_name => {
    it(`Falha com role_name inválido (${JSON.stringify(role_name)})`, () => {
      rolesUpdate({
        token: validToken,
        id: validId,
        role_name,
        description: validDescription
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- description inválido, ausente, tipos errados, limites ---
  it('Falha sem description', () => {
    rolesUpdate({
      token: validToken,
      id: validId,
      role_name: validRoleName
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  [null, '', 123, {}, [], true, false].forEach(description => {
    it(`Falha com description inválido (${JSON.stringify(description)})`, () => {
      rolesUpdate({
        token: validToken,
        id: validId,
        role_name: validRoleName,
        description
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- can_delete inválido, limites ---
  ['abc', 123, {}, [], 'true', 'false'].forEach(can_delete => {
    it(`Falha com can_delete inválido (${JSON.stringify(can_delete)})`, () => {
      rolesUpdate({
        token: validToken,
        id: validId,
        role_name: validRoleName,
        description: validDescription,
        can_delete
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- Campos extras ---
  it('Ignora campo extra no body', () => {
    rolesUpdate({
      token: validToken,
      id: validId,
      role_name: validRoleName,
      description: validDescription,
      can_delete: true,
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
        url: `${BASE_URL}/Roles/Update`,
        form: true,
        body: {
          token: validToken,
          id: validId,
          role_name: validRoleName,
          description: validDescription
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
      url: `${BASE_URL}/Roles/Update`,
      body: {
        token: validToken,
        id: validId,
        role_name: validRoleName,
        description: validDescription
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  // --- Contrato: Não vazar informações sensíveis ---
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    rolesUpdate({
      token: "' OR 1=1 --",
      id: validId,
      role_name: validRoleName,
      description: validDescription
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // --- Headers ---
  it('Headers devem conter CORS e content-type', () => {
    rolesUpdate({
      token: validToken,
      id: validId,
      role_name: validRoleName,
      description: validDescription
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- Rate limit (se aplicável) ---
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      rolesUpdate({
        token: validToken,
        id: validId,
        role_name: validRoleName,
        description: validDescription
      })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  // --- Duplicidade: Aceita requisições idênticas sequenciais ---
  it('Permite requisições duplicadas rapidamente', () => {
    rolesUpdate({
      token: validToken,
      id: validId,
      role_name: validRoleName,
      description: validDescription
    })
      .then(() => rolesUpdate({
        token: validToken,
        id: validId,
        role_name: validRoleName,
        description: validDescription
      }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });

});