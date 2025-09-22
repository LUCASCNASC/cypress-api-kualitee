// Testes automatizados para API: POST /defects/delete_image
// Segue o padrão do arquivo de exemplo fornecido (update.cy.js)

describe('API - Defects Delete Image - /defects/delete_image', () => {
  const validToken = 'token_valido_aqui';
  const validProjectId = 77;
  const validImageId = 555;

  function defectsDeleteImage(body, options = {}) {
    return cy.request({
      method: 'POST',
      url: '/Defect/Deleteimages',
      form: true,
      body,
      failOnStatusCode: false,
      ...options,
    });
  }

  // --- POSITIVO ---
  it('Deleta imagem de defeito com todos os campos obrigatórios válidos', () => {
    defectsDeleteImage({
      token: validToken,
      project_id: validProjectId,
      id: validImageId
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- NEGATIVO: Auth ---
  it('Falha sem token', () => {
    defectsDeleteImage({
      project_id: validProjectId,
      id: validImageId
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  ['token_invalido', null, '', 12345].forEach(token => {
    it(`Falha com token inválido (${JSON.stringify(token)})`, () => {
      defectsDeleteImage({
        token,
        project_id: validProjectId,
        id: validImageId
      }).then(response => {
        expect([400, 401, 403]).to.include(response.status);
      });
    });
  });

  // --- Campos obrigatórios ausentes ---
  ['project_id', 'id'].forEach(field => {
    it(`Falha sem campo obrigatório ${field}`, () => {
      const body = {
        token: validToken,
        project_id: validProjectId,
        id: validImageId
      };
      delete body[field];
      defectsDeleteImage(body).then(response => {
        expect([400, 422]).to.include(response.status);
      });
    });
  });

  // --- Campos obrigatórios inválidos ---
  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(project_id => {
    it(`Falha com project_id inválido (${JSON.stringify(project_id)})`, () => {
      defectsDeleteImage({
        token: validToken,
        project_id,
        id: validImageId
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(id => {
    it(`Falha com id inválido (${JSON.stringify(id)})`, () => {
      defectsDeleteImage({
        token: validToken,
        project_id: validProjectId,
        id
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- Campos extras ---
  it('Ignora campo extra no body', () => {
    defectsDeleteImage({
      token: validToken,
      project_id: validProjectId,
      id: validImageId,
      foo: 'bar'
    }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  // --- HTTP Method errado ---
  ['GET', 'PUT', 'DELETE', 'PATCH'].forEach(method => {
    it(`Falha com método HTTP ${method}`, () => {
      cy.request({
        method,
        url: '/Defect/Deleteimages',
        form: true,
        body: {
          token: validToken,
          project_id: validProjectId,
          id: validImageId
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
      url: '/Defect/Deleteimages',
      body: {
        token: validToken,
        project_id: validProjectId,
        id: validImageId
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  // --- Contrato: Não vazar informações sensíveis ---
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    defectsDeleteImage({
      token: "' OR 1=1 --",
      project_id: validProjectId,
      id: validImageId
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // --- Headers ---
  it('Headers devem conter CORS e content-type', () => {
    defectsDeleteImage({
      token: validToken,
      project_id: validProjectId,
      id: validImageId
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- Rate limit (se aplicável) ---
  it('Falha após múltiplas deleções rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      defectsDeleteImage({
        token: validToken,
        project_id: validProjectId,
        id: validImageId
      })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  // --- Duplicidade: Aceita deleções idênticas sequenciais ---
  it('Permite deleções duplicadas rapidamente', () => {
    defectsDeleteImage({
      token: validToken,
      project_id: validProjectId,
      id: validImageId
    }).then(() =>
      defectsDeleteImage({
        token: validToken,
        project_id: validProjectId,
        id: validImageId
      })
    ).then((response) => {
      expect([200, 400, 401, 409]).to.include(response.status);
    });
  });

});