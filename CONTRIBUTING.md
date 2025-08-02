# Contributing to Anwar Sales Ecosystem

Thank you for your interest in contributing to the Anwar Sales Ecosystem! This document provides guidelines for contributing to this project.

## 🤝 How to Contribute

### 1. **Report Issues**
- Use GitHub Issues to report bugs or suggest features
- Provide clear descriptions and steps to reproduce
- Include relevant system information and error messages

### 2. **Submit Code Changes**
- Fork the repository
- Create a feature branch: `git checkout -b feature/your-feature-name`
- Make your changes following our coding standards
- Test thoroughly using our test suite
- Submit a pull request with a clear description

### 3. **Code Standards**

#### **JavaScript Standards**
- Use descriptive function and variable names
- Add JSDoc comments for all functions
- Follow Google Apps Script best practices
- Handle errors gracefully with try-catch blocks

#### **Documentation Standards**
- Update README.md for significant changes
- Document new functions in API reference
- Include user stories for new features
- Update workflow diagrams if applicable

### 4. **Testing Requirements**
- All new features must include tests
- Run existing test suite: `runAllTests()`
- Ensure 100% test coverage for new functions
- Test WhatsApp notifications in development environment

### 5. **Commit Message Format**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `test`: Adding or updating tests
- `refactor`: Code refactoring
- `chore`: Maintenance tasks

**Example:**
```
feat(order): Add automatic dispute escalation

- Implement automatic BDO notification when engineer unavailable
- Add configurable escalation timeouts
- Include fallback notification mechanisms

Closes #123
```

## 🔧 Development Setup

### **Prerequisites**
- Google Apps Script access
- Node.js (for local development tools)
- WhatsApp Business API credentials

### **Local Development**
1. Clone the repository
2. Copy `.env.example` to `.env` and configure
3. Update `config.js` with your spreadsheet IDs
4. Run initial setup: `setupProject()`
5. Create test data: `createTestData()`

### **Testing**
- Run all tests: `runAllTests()`
- Test specific modules: `runVisitTests()`, `runOrderTests()`
- Manual testing using Google Forms

## 📋 Code Review Process

### **Review Criteria**
- Code follows established patterns
- Proper error handling implemented
- Documentation updated
- Tests pass successfully
- Performance impact considered

### **Review Checklist**
- [ ] Code is readable and well-documented
- [ ] Error handling is comprehensive
- [ ] Tests cover new functionality
- [ ] No security vulnerabilities
- [ ] Performance is acceptable
- [ ] Documentation is updated

## 🐛 Bug Reports

### **Bug Report Template**
```markdown
**Bug Description:**
Clear description of the issue

**Steps to Reproduce:**
1. Step one
2. Step two
3. Step three

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happens

**Environment:**
- Google Apps Script version
- Browser used
- Form/module affected

**Error Messages:**
Include any error messages or logs
```

## 💡 Feature Requests

### **Feature Request Template**
```markdown
**Feature Description:**
Clear description of the proposed feature

**User Story:**
As a [user type], I want [goal] so that [benefit]

**Business Justification:**
Why this feature is needed

**Technical Considerations:**
Any technical requirements or constraints

**Acceptance Criteria:**
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3
```

## 🔒 Security Guidelines

### **Security Best Practices**
- Never commit API keys or credentials
- Use environment variables for sensitive data
- Validate all user inputs
- Implement proper access controls
- Follow Google Apps Script security guidelines

### **Reporting Security Issues**
- **DO NOT** create public issues for security vulnerabilities
- Email security issues to: [security@anwarsales.com]
- Include detailed description and reproduction steps
- Allow reasonable time for response before disclosure

## 📚 Resources

### **Documentation**
- [README.md](README.md) - Complete system documentation
- [API Reference](README.md#api-reference) - Function documentation
- [User Stories](README.md#user-stories) - Feature requirements

### **Development Tools**
- [Google Apps Script](https://script.google.com/)
- [Google Sheets API](https://developers.google.com/sheets/api)
- [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)

### **Community**
- GitHub Issues for questions and discussions
- Project Wiki for detailed documentation
- Regular contributor meetings (TBD)

## 🎯 Roadmap

### **Short-term Goals**
- Mobile app integration
- Advanced analytics dashboard
- Performance optimization
- Multi-language support

### **Long-term Vision**
- AI-powered recommendations
- Machine learning for demand prediction
- Integration with external ERP systems
- Advanced reporting and business intelligence

---

**Thank you for contributing to the Anwar Sales Ecosystem! Together, we're building a better construction supply chain management system.**
