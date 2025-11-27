const PATH_API = '/Roles/Create';
const validToken = Cypress.env('VALID_TOKEN');

const validRoleName = 'Novo Papel';
const validDescription = 'Descrição do papel';
const validCanDelete = true;

describe('API rest - Roles Create - /roles/create', () => {

  function rolesCreate(body, options = {}) {
    return cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      form: true,
      body,
      failOnStatusCode: false,
      ...options,
    });
  }
  
  it('Cria role com token, role_name e description válidos', () => {
    rolesCreate({ token: validToken, role_name: validRoleName, description: validDescription }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.exist;
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Cria role com can_delete true', () => {
    rolesCreate({ token: validToken, role_name: validRoleName, description: validDescription, can_delete: true }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  it('Cria role com can_delete false', () => {
    rolesCreate({ token: validToken, role_name: validRoleName, description: validDescription, can_delete: false }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  // --- NEGATIVO: Auth ---
  it('Falha sem token', () => {
    rolesCreate({ role_name: validRoleName, description: validDescription }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  ['token_invalido', null, '', 12345, "' OR 1=1 --"].forEach(token => {
    it(`Falha com token inválido (${JSON.stringify(token)})`, () => {
      rolesCreate({ token, role_name: validRoleName, description: validDescription }).then(response => {
        expect([400, 401, 403]).to.include(response.status);
      });
    });
  });

  // --- Campos obrigatórios: role_name e description ---
  it('Falha sem role_name', () => {
    rolesCreate({ token: validToken, description: validDescription }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Falha sem description', () => {
    rolesCreate({ token: validToken, role_name: validRoleName }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  [null, '', 123, {}, [], true, false].forEach(role_name => {
    it(`Falha com role_name inválido (${JSON.stringify(role_name)})`, () => {
      rolesCreate({ token: validToken, role_name, description: validDescription }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  [null, '', 123, {}, [], true, false].forEach(description => {
    it(`Falha com description inválido (${JSON.stringify(description)})`, () => {
      rolesCreate({ token: validToken, role_name: validRoleName, description }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- can_delete inválido, limites ---
  ['abc', 123, {}, [], 'true', 'false'].forEach(can_delete => {
    it(`Falha com can_delete inválido (${JSON.stringify(can_delete)})`, () => {
      rolesCreate({ token: validToken, role_name: validRoleName, description: validDescription, can_delete }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- Campos extras ---
  it('Ignora campo extra no body', () => {
    rolesCreate({ token: validToken, role_name: validRoleName, description: validDescription, can_delete: true, extra: 'foo' }).then(response => {
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
        body: { token: validToken, role_name: validRoleName, description: validDescription },
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
      body: { token: validToken, role_name: validRoleName, description: validDescription },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  // --- Contrato: Não vazar informações sensíveis ---
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    rolesCreate({ token: "' OR 1=1 --", role_name: validRoleName, description: validDescription }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // --- Headers ---
  it('Headers devem conter CORS e content-type', () => {
    rolesCreate({ token: validToken, role_name: validRoleName, description: validDescription }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- Rate limit (se aplicável) ---
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      rolesCreate({ token: validToken, role_name: validRoleName, description: validDescription })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  // --- Duplicidade: Aceita requisições idênticas sequenciais ---
  it('Permite requisições duplicadas rapidamente', () => {
    rolesCreate({ token: validToken, role_name: validRoleName, description: validDescription })
      .then(() => rolesCreate({ token: validToken, role_name: validRoleName, description: validDescription }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });

});