const validToken = Cypress.env('VALID_TOKEN');
const PATH_API = '/Defect/Deleteimages';

const validProjectId = Cypress.env('VALID_PROJECT_ID');

const validImageId = 555;

describe('Cycle - Defects Delete Image - /defects/delete_image', () => {

  it('Status Code are 200', () => {
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

  it('Status Code are 400, 401, 403', () => {
    defectsDeleteImage({
      project_id: validProjectId,
      id: validImageId
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code are 200', () => {
    defectsDeleteImage({
      token: validToken,
      project_id: validProjectId,
      id: validImageId,
      foo: 'bar'
    }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  it('Status Code are 400, 415', () => {
    cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
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
  
  it('Status Code are 429', () => {
    defectsDeleteImage({
      token: validToken,
      project_id: validProjectId,
      id: validImageId
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code are 429', () => {
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

  it('Status Code are 200, 400, 401, 409', () => {
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