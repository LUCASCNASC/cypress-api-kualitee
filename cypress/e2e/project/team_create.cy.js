const PATH_API = '/Project/ProjectTeamAssigned';
const validToken = Cypress.env('VALID_TOKEN');

const validProjectId = Cypress.env('VALID_PROJECT_ID');

const validUserIds = [10, 11, 12, 13];

describe('API rest - Project Team Assigned - /team/create', () => {

  it('Status Code 200', () => {
    teamCreate({
      token: validToken,
      project_id: validProjectId,
      'project_user[0]': validUserIds[0],
      'project_user[1]': validUserIds[1],
      'project_user[2]': validUserIds[2],
      'project_user[3]': validUserIds[3]
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Falha sem token', () => {
    teamCreate({
      project_id: validProjectId,
      'project_user[0]': validUserIds[0],
      'project_user[1]': validUserIds[1],
      'project_user[2]': validUserIds[2],
      'project_user[3]': validUserIds[3]
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token inválido', () => {
    teamCreate({
      token: 'token_invalido',
      project_id: validProjectId,
      'project_user[0]': validUserIds[0],
      'project_user[1]': validUserIds[1],
      'project_user[2]': validUserIds[2],
      'project_user[3]': validUserIds[3]
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token expirado', () => {
    teamCreate({
      token: 'token_expirado',
      project_id: validProjectId,
      'project_user[0]': validUserIds[0],
      'project_user[1]': validUserIds[1],
      'project_user[2]': validUserIds[2],
      'project_user[3]': validUserIds[3]
    }).then(response => {
      expect([401, 403]).to.include(response.status);
    });
  });

  it('Falha com token nulo', () => {
    teamCreate({
      token: null,
      project_id: validProjectId,
      'project_user[0]': validUserIds[0],
      'project_user[1]': validUserIds[1],
      'project_user[2]': validUserIds[2],
      'project_user[3]': validUserIds[3]
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Ignora campo extra no body', () => {
    teamCreate({
      token: validToken,
      project_id: validProjectId,
      'project_user[0]': validUserIds[0],
      'project_user[1]': validUserIds[1],
      'project_user[2]': validUserIds[2],
      'project_user[3]': validUserIds[3],
      extra: 'foo'
    }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  it('Falha com Content-Type application/json', () => {
    cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      body: {
        token: validToken,
        project_id: validProjectId,
        'project_user[0]': validUserIds[0],
        'project_user[1]': validUserIds[1],
        'project_user[2]': validUserIds[2],
        'project_user[3]': validUserIds[3]
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    teamCreate({
      token: "' OR 1=1 --",
      project_id: validProjectId,
      'project_user[0]': validUserIds[0],
      'project_user[1]': validUserIds[1],
      'project_user[2]': validUserIds[2],
      'project_user[3]': validUserIds[3]
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  it('Headers devem conter CORS e content-type', () => {
    teamCreate({
      token: validToken,
      project_id: validProjectId,
      'project_user[0]': validUserIds[0],
      'project_user[1]': validUserIds[1],
      'project_user[2]': validUserIds[2],
      'project_user[3]': validUserIds[3]
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      teamCreate({
        token: validToken,
        project_id: validProjectId,
        'project_user[0]': validUserIds[0],
        'project_user[1]': validUserIds[1],
        'project_user[2]': validUserIds[2],
        'project_user[3]': validUserIds[3]
      })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  it('Permite requisições duplicadas rapidamente', () => {
    teamCreate({
      token: validToken,
      project_id: validProjectId,
      'project_user[0]': validUserIds[0],
      'project_user[1]': validUserIds[1],
      'project_user[2]': validUserIds[2],
      'project_user[3]': validUserIds[3]
    })
      .then(() => teamCreate({
        token: validToken,
        project_id: validProjectId,
        'project_user[0]': validUserIds[0],
        'project_user[1]': validUserIds[1],
        'project_user[2]': validUserIds[2],
        'project_user[3]': validUserIds[3]
      }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });
});