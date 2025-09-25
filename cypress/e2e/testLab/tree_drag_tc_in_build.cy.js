// Testes automatizados para API: POST /manage_test_case/tree_drag_tc_in_build
// Segue o padrão do arquivo de exemplo fornecido (update.cy.js)

describe('API - Manage Test Case Tree Drag TC In Build - /manage_test_case/tree_drag_tc_in_build', () => {
  const validToken = 'token_valido_aqui';
  const validProjectId = 77;
  const validBuildId = 10;

  function treeDragTcInBuild(body, options = {}) {
    return cy.request({
      method: 'POST',
      url: '/TestLab/TreeTragTesetCaseinBuild',
      form: true,
      body,
      failOnStatusCode: false,
      ...options,
    });
  }

  // --- POSITIVO ---
  it('Consulta árvore de casos de teste do build com todos os campos obrigatórios válidos', () => {
    treeDragTcInBuild({
      token: validToken,
      project_id: validProjectId,
      build_id: validBuildId
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- NEGATIVO: Auth ---
  it('Falha sem token', () => {
    treeDragTcInBuild({
      project_id: validProjectId,
      build_id: validBuildId
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  ['token_invalido', null, '', 12345].forEach(token => {
    it(`Falha com token inválido (${JSON.stringify(token)})`, () => {
      treeDragTcInBuild({
        token,
        project_id: validProjectId,
        build_id: validBuildId
      }).then(response => {
        expect([400, 401, 403]).to.include(response.status);
      });
    });
  });

  // --- Campos obrigatórios ausentes ---
  ['project_id', 'build_id'].forEach(field => {
    it(`Falha sem campo obrigatório ${field}`, () => {
      const body = {
        token: validToken,
        project_id: validProjectId,
        build_id: validBuildId
      };
      delete body[field];
      treeDragTcInBuild(body).then(response => {
        expect([400, 422]).to.include(response.status);
      });
    });
  });

  // --- Campos obrigatórios inválidos ---
  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(project_id => {
    it(`Falha com project_id inválido (${JSON.stringify(project_id)})`, () => {
      treeDragTcInBuild({
        token: validToken,
        project_id,
        build_id: validBuildId
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(build_id => {
    it(`Falha com build_id inválido (${JSON.stringify(build_id)})`, () => {
      treeDragTcInBuild({
        token: validToken,
        project_id: validProjectId,
        build_id
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- Campos extras ---
  it('Ignora campo extra no body', () => {
    treeDragTcInBuild({
      token: validToken,
      project_id: validProjectId,
      build_id: validBuildId,
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
        url: '/TestLab/TreeTragTesetCaseinBuild',
        form: true,
        body: {
          token: validToken,
          project_id: validProjectId,
          build_id: validBuildId
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
      url: '/TestLab/TreeTragTesetCaseinBuild',
      body: {
        token: validToken,
        project_id: validProjectId,
        build_id: validBuildId
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  // --- Contrato: Não vazar informações sensíveis ---
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    treeDragTcInBuild({
      token: "' OR 1=1 --",
      project_id: validProjectId,
      build_id: validBuildId
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // --- Headers ---
  it('Headers devem conter CORS e content-type', () => {
    treeDragTcInBuild({
      token: validToken,
      project_id: validProjectId,
      build_id: validBuildId
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- Rate limit (se aplicável) ---
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      treeDragTcInBuild({
        token: validToken,
        project_id: validProjectId,
        build_id: validBuildId
      })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  // --- Duplicidade: Aceita requisições idênticas sequenciais ---
  it('Permite requisições duplicadas rapidamente', () => {
    treeDragTcInBuild({
      token: validToken,
      project_id: validProjectId,
      build_id: validBuildId
    }).then(() =>
      treeDragTcInBuild({
        token: validToken,
        project_id: validProjectId,
        build_id: validBuildId
      })
    ).then((response) => {
      expect([200, 400, 401, 409]).to.include(response.status);
    });
  });

});