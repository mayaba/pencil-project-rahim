const chai = require('chai');
const chaihttp = require('chai-http');
const server = require('../app');

chai.should();
chai.use(chaihttp);

describe('GET /search', () => {
  it('should return an error message when a topic is not provided', (done) => {
    chai
      .request(server)
      .get('/search')
      .end((err, res) => {
        res.should.have.status(404);
        res.body.should.have.property('success').eql(false);
        res.body.should.have.property('message').eql('No topic provided');
        done();
      });
  });

  it('should return an array of questions ids', async () => {
    chai
      .request(server)
      .get('/search?q=Proteins')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property('success').eql(true);
        res.body.should.have.property('questions');
        res.body.questions.should.be.a('array');
        res.body.questions.length.should.be.greaterThan(0);
        done();
      });
  });

  it('should return an error message when there is no results', async () => {
    chai
      .request(server)
      .get('/search?q=Pro')
      .end((err, res) => {
        res.should.have.status(404);
        res.body.should.have.property('success').eql(false);
        res.body.should.have
          .property('message')
          .eql('Invalid topic or No Questions found');
        done();
      });
  });
});
