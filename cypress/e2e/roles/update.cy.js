const PATH_API = '/Roles/Update';
const validToken = Cypress.env('VALID_TOKEN');

const validId = Cypress.env('VALID_ID');

const validRoleName = 'Papel Atualizado';
const validDescription = 'Descrição atualizada';
const validCanDelete = true;

describe('API rest - Roles Update - /roles/update', () => {

  it('Status Code is 200', () => {
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

  it('Status Code is 400, 401, 403', () => {
    rolesUpdate({
      id: validId,
      role_name: validRoleName,
      description: validDescription
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha sem id', () => {
    rolesUpdate({
      token: validToken,
      role_name: validRoleName,
      description: validDescription
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Falha sem role_name', () => {
    rolesUpdate({
      token: validToken,
      id: validId,
      description: validDescription
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Falha sem description', () => {
    rolesUpdate({
      token: validToken,
      id: validId,
      role_name: validRoleName
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Status Code is 200', () => {
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

  it('Status Code is 400, 415', () => {
    cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
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

  it('Status Code is 200, 400, 401, 409', () => {
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