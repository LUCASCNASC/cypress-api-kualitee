const PATH_API = '/Roles/Create';
const validToken = Cypress.env('VALID_TOKEN');

const validRoleName = 'Novo Papel';
const validDescription = 'Descrição do papel';
const validCanDelete = true;

describe('API rest - Roles Create - /roles/create', () => {

  it('Status Code is 200', () => {
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

  it('Status Code is 400, 401, 403', () => {
    rolesCreate({ role_name: validRoleName, description: validDescription }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

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

  it('Status Code is 200', () => {
    rolesCreate({ token: validToken, role_name: validRoleName, description: validDescription, can_delete: true, extra: 'foo' }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  it('Status Code is 400, 415', () => {
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

  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    rolesCreate({ token: "' OR 1=1 --", role_name: validRoleName, description: validDescription }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  it('Headers devem conter CORS e content-type', () => {
    rolesCreate({ token: validToken, role_name: validRoleName, description: validDescription }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      rolesCreate({ token: validToken, role_name: validRoleName, description: validDescription })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  it('Status Code is 200, 400, 401, 409', () => {
    rolesCreate({ token: validToken, role_name: validRoleName, description: validDescription })
      .then(() => rolesCreate({ token: validToken, role_name: validRoleName, description: validDescription }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });
});