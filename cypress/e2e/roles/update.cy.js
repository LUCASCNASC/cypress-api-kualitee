const PATH_API = '/Roles/Update';
const validToken = Cypress.env('VALID_TOKEN');

const validId = Cypress.env('VALID_ID');

const validRoleName = 'Papel Atualizado';
const validDescription = 'Descrição atualizada';
const validCanDelete = true;

describe('Roles Update - /roles/update', () => {

  it('Status Code: 200', () => {
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

  it('Status Code: 200', () => {
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

  it('Status Code: 200', () => {
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

  it('Status Code: 400, 401, 403', () => {
    rolesUpdate({
      id: validId,
      role_name: validRoleName,
      description: validDescription
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code: 400, 422, 404', () => {
    rolesUpdate({
      token: validToken,
      role_name: validRoleName,
      description: validDescription
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Status Code: 400, 422, 404', () => {
    rolesUpdate({
      token: validToken,
      id: validId,
      description: validDescription
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Status Code: 400, 422, 404', () => {
    rolesUpdate({
      token: validToken,
      id: validId,
      role_name: validRoleName
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Status Code: 200', () => {
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

  it('Status Code: 400, 415', () => {
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

  it('Status Code: 429', () => {
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

  it('Status Code: 429', () => {
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

  it('Status Code: 200, 400, 401, 409', () => {
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