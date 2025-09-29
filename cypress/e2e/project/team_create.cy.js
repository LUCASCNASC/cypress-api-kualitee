const PATH_API = '/Project/ProjectTeamAssigned'

describe('API - Project Team Assigned - /team/create', () => {
  const validToken = 'token_valido_aqui';
  const validProjectId = 77; // Substitua por um id de projeto válido do seu ambiente
  const validUserIds = [10, 11, 12, 13]; // Substitua por ids de usuários válidos

  function teamCreate(body, options = {}) {
    return cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      form: true,
      body,
      failOnStatusCode: false,
      ...options,
    });
  }

  // --- POSITIVO ---
  it('Associa usuários a um projeto com dados válidos', () => {
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

  // --- NEGATIVOS: Auth ---
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

  // --- Campos obrigatórios ausentes ---
  ['project_id', 'project_user[0]', 'project_user[1]', 'project_user[2]', 'project_user[3]'].forEach(field => {
    it(`Falha sem campo obrigatório ${field}`, () => {
      const body = {
        token: validToken,
        project_id: validProjectId,
        'project_user[0]': validUserIds[0],
        'project_user[1]': validUserIds[1],
        'project_user[2]': validUserIds[2],
        'project_user[3]': validUserIds[3]
      };
      delete body[field];
      teamCreate(body).then(response => {
        expect([400, 422]).to.include(response.status);
      });
    });
  });

  // --- Campos obrigatórios vazios/inválidos ---
  ['project_id', 'project_user[0]', 'project_user[1]', 'project_user[2]', 'project_user[3]'].forEach(field => {
    [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(invalidValue => {
      it(`Falha com ${field} inválido (${JSON.stringify(invalidValue)})`, () => {
        const body = {
          token: validToken,
          project_id: validProjectId,
          'project_user[0]': validUserIds[0],
          'project_user[1]': validUserIds[1],
          'project_user[2]': validUserIds[2],
          'project_user[3]': validUserIds[3]
        };
        body[field] = invalidValue;
        teamCreate(body).then(response => {
          expect([400, 422, 404]).to.include(response.status);
        });
      });
    });
  });

  // --- Campos extras ---
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

  // --- HTTP Method errado ---
  ['GET', 'PUT', 'DELETE', 'PATCH'].forEach(method => {
    it(`Falha com método HTTP ${method}`, () => {
      cy.request({
        method,
        url: `/${PATH_API}`,
        form: true,
        body: {
          token: validToken,
          project_id: validProjectId,
          'project_user[0]': validUserIds[0],
          'project_user[1]': validUserIds[1],
          'project_user[2]': validUserIds[2],
          'project_user[3]': validUserIds[3]
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

  // --- Contrato: Não vazar informações sensíveis ---
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

  // --- Headers ---
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

  // --- Rate limit (se aplicável) ---
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

  // --- Duplicidade: Aceita requisições idênticas sequenciais ---
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