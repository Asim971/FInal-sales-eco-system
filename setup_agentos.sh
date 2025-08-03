#!/bin/bash

# AgentOS Universal Setup Script
# This script creates a complete AgentOS framework for any project type.
# It provides detailed templates and AI-readable instructions for customization.
# 
# Usage: ./setup_agentos.sh [project-name]
# 
# The script creates a .agent-os directory with all necessary files
# and provides structured instructions for AI models to analyze existing 
# project documentation and update these files accordingly.

PROJECT_NAME=${1:-"your-project"}

echo "🚀 Setting up AgentOS framework for: $PROJECT_NAME"
echo "📋 This creates a universal template with AI-readable instructions"
echo "🤖 AI models can analyze your project and update these files automatically"

# Create the main .agent-os directory
mkdir -p .agent-os
cd .agent-os

echo "📁 Creating universal directory structure..."

# Create directories
mkdir -p agents/prompts
mkdir -p frameworks
mkdir -p product
mkdir -p projects
mkdir -p prompts/context-engineering-expert/extensions
mkdir -p prompts/emergency
mkdir -p roadmap
mkdir -p templates

echo "📝 Creating configuration files with content..."

# Create AGENT_OS_UPDATE_SUMMARY.md
cat > AGENT_OS_UPDATE_SUMMARY.md << 'EOF'
# AgentOS Update Summary

## Latest Updates

### Version 1.0.0 - Initial Setup
- Created complete AgentOS directory structure
- Implemented core configuration files with AI-readable instructions
- Added comprehensive agent templates with detailed customization guides
- Established prompt engineering framework with project analysis patterns

## Change Log

### Features Added
- Project configuration management with structured analysis templates
- AI development guidelines with technology-agnostic patterns
- Code standards enforcement with multi-language adaptability
- Agent workflow coordination with role-based customization
- Context engineering framework with project documentation integration

### AI Model Instructions
🤖 **For AI Models analyzing this project:**

1. **Project Analysis Phase:**
   - Read all existing project files (README.md, package.json, requirements.txt, etc.)
   - Identify technology stack from dependencies and file structure
   - Extract project purpose and goals from documentation
   - Identify stakeholders from contribution guidelines or team documentation

2. **File Update Process:**
   - Follow the structured templates in each .agent-os file
   - Replace placeholder content with project-specific information
   - Maintain consistency across all configuration files
   - Validate that all cross-references between files are accurate

3. **Validation Checklist:**
   - Ensure all placeholder text has been replaced
   - Verify technology stack consistency across files
   - Confirm business objectives align with project documentation
   - Check that success metrics are measurable and relevant

### Next Steps for Customization
- Analyze existing project documentation in parent directories
- Extract project-specific information using the structured templates
- Update each configuration file with discovered information
- Validate cross-file consistency and completeness
- Generate project-specific agent configurations
EOF

# Create ai-guidelines.md
cat > ai-guidelines.md << 'EOF'
# AI Guidelines for AgentOS Projects

## 🤖 AI MODEL INSTRUCTIONS
This file contains guidelines for AI coding assistants. When customizing this file:

1. **Read Project Context First:**
   - Scan parent directory for README.md, package.json, requirements.txt, Cargo.toml, etc.
   - Identify primary programming language from file extensions and dependencies
   - Extract architecture patterns from existing code structure
   - Identify frameworks and libraries from dependency files

2. **Technology Stack Detection:**
   ```
   Look for these files to determine stack:
   - package.json → Node.js/JavaScript/TypeScript
   - requirements.txt/pyproject.toml → Python
   - Cargo.toml → Rust
   - pom.xml/build.gradle → Java
   - go.mod → Go
   - pubspec.yaml → Dart/Flutter
   - *.csproj → .NET/C#
   ```

3. **Update Instructions:**
   - Replace all [LANGUAGE] placeholders with detected language
   - Update code examples to match project's language and patterns
   - Modify security requirements based on project domain
   - Add compliance requirements if healthcare/finance/government project

## Overview
These guidelines provide best practices for using AI coding assistants in development projects, ensuring alignment with project architecture and requirements while maintaining high-quality standards.

## 📝 CUSTOMIZATION INSTRUCTIONS
🤖 **AI Model Task:** Replace the sections below with project-specific information:

### Technology Stack Detection
```
ANALYZE PROJECT FILES TO DETERMINE:
1. Primary programming language: [DETECT FROM FILE EXTENSIONS]
2. Backend framework: [DETECT FROM DEPENDENCIES] 
3. Frontend framework: [DETECT FROM PACKAGE.JSON/DEPENDENCIES]
4. Database: [DETECT FROM CONFIG FILES/DEPENDENCIES]
5. Cloud platform: [DETECT FROM DEPLOYMENT FILES]
6. Testing framework: [DETECT FROM DEV DEPENDENCIES]
```

## Development Standards

### Modern Development Implementation
**🔧 AI INSTRUCTION: Replace with detected technology stack**

**Template for Language-Specific Updates:**
```
IF language === "javascript" OR "typescript":
  - Use const/let, arrow functions, async/await
  - Implement ES6+ features
  - Use proper TypeScript types if .ts files found

IF language === "python":
  - Use type hints (Python 3.6+)
  - Follow PEP 8 style guide
  - Use dataclasses or Pydantic for data models
  - Implement async/await for I/O operations

IF language === "java":
  - Use modern Java features (8+)
  - Implement proper exception handling
  - Use Spring Boot patterns if detected
  - Follow clean code principles

IF language === "go":
  - Follow Go conventions
  - Use proper error handling
  - Implement interfaces appropriately
  - Use context for cancellation

[ADD MORE LANGUAGES AS DETECTED]
```

### Example Code Template (AI: Replace with project language)
```[DETECTED_LANGUAGE]
// AI INSTRUCTION: Replace this entire block with language-appropriate example
// Example for [DETECTED_LANGUAGE] - Update based on project analysis

const processData = async ({ id, data, ...options }) => {
  try {
    const validated = await validateInput({ id, data, ...options });
    const result = await ProjectService.process(validated);
    return { success: true, result };
  } catch (error) {
    Logger.error(`Processing failed: ${error.message}`);
    throw new ProjectError('PROCESS_FAILED', error.message, { id });
  }
};
```

### Prompt Engineering Best Practices

#### Context-Aware Prompting
**📋 AI INSTRUCTION: Customize based on project domain analysis**

```
DOMAIN DETECTION RULES:
- IF healthcare files/terms → Add HIPAA compliance requirements
- IF financial files/terms → Add PCI DSS, SOX compliance requirements  
- IF government files/terms → Add FedRAMP, FISMA requirements
- IF educational files/terms → Add FERPA compliance requirements
- IF SaaS application → Add scalability and multi-tenancy considerations
- IF API service → Add rate limiting and security considerations
- IF mobile app → Add offline capabilities and battery optimization
- IF data pipeline → Add data quality and pipeline monitoring
```

**Customization Template:**
- Reference your project's architecture documents: [AI: LIST FOUND DOCS]
- Include stakeholder requirements for [AI: DETECTED DOMAIN] industry
- Emphasize [AI: DETECTED COMPLIANCE] requirements
- Consider scalability for [AI: ESTIMATED USER BASE] users

#### Task-Oriented Development
- Break complex requests into manageable subtasks
- Maintain clear progress tracking using [AI: DETECTED PROJECT MANAGEMENT TOOL]
- Implement validation checkpoints for quality assurance
- Document lessons learned in [AI: DETECTED DOCUMENTATION FORMAT]

## Integration Guidelines

### Project Architecture
**🏗️ AI INSTRUCTION: Update based on detected architecture patterns**

```
ARCHITECTURE DETECTION:
- Scan for docker-compose.yml → Microservices architecture
- Look for monorepo structure → Monolithic architecture  
- Check for serverless configs → Serverless architecture
- Find Kubernetes configs → Container orchestration
- Detect API directories → API-first architecture
```

**Detected Patterns (AI: Fill based on analysis):**
- Architecture style: [AI: DETECTED ARCHITECTURE]
- Communication patterns: [AI: REST/GraphQL/gRPC/etc.]
- Data persistence: [AI: DETECTED DATABASE PATTERN]
- Deployment strategy: [AI: DETECTED DEPLOYMENT]

### Quality Assurance
**✅ AI INSTRUCTION: Adapt based on detected testing and CI/CD tools**

```
TOOL DETECTION:
- .github/workflows → GitHub Actions
- .gitlab-ci.yml → GitLab CI
- jenkins/ → Jenkins
- test/ directory → Testing framework detection
- jest.config.js → Jest testing
- pytest.ini → Pytest
- coverage/ → Coverage tools
```

**Detected Tools (AI: Update based on findings):**
- Testing framework: [AI: DETECTED TESTING TOOL]
- CI/CD platform: [AI: DETECTED CI/CD]
- Code quality tools: [AI: DETECTED LINTING/STATIC ANALYSIS]
- Coverage requirements: [AI: CURRENT COVERAGE THRESHOLD]

## Reference Documents
**📚 AI INSTRUCTION: Update these paths based on actual project structure**

```
DOCUMENT DISCOVERY RULES:
1. Look for README.md files in root and subdirectories
2. Find CONTRIBUTING.md for team processes
3. Locate API documentation (docs/, api/, swagger.yml)
4. Identify architecture docs (architecture/, docs/architecture/)
5. Find security docs (SECURITY.md, security/)
```

**Found Documentation (AI: Update with actual file paths):**
- Project overview: [AI: PATH TO MAIN README]
- Technical specifications: [AI: PATH TO TECH SPECS]
- API documentation: [AI: PATH TO API DOCS]
- Architecture documentation: [AI: PATH TO ARCHITECTURE]
- Security guidelines: [AI: PATH TO SECURITY DOCS]
- Contributing guidelines: [AI: PATH TO CONTRIBUTING]

## 🔍 AI Model Analysis Checklist

### Project Discovery Phase:
- [ ] Scan root directory for project metadata files
- [ ] Identify primary and secondary programming languages
- [ ] Detect framework and library dependencies
- [ ] Analyze project structure and architecture patterns
- [ ] Extract business domain from README and documentation
- [ ] Identify compliance requirements from industry/domain
- [ ] Detect existing development tools and processes

### Customization Phase:
- [ ] Replace all placeholder content with discovered information
- [ ] Update code examples to match project language and style
- [ ] Modify security requirements based on detected domain
- [ ] Adapt tool recommendations to existing project toolchain
- [ ] Ensure consistency with detected architecture patterns
- [ ] Validate cross-references with other AgentOS files

### Validation Phase:
- [ ] Verify all placeholders have been replaced
- [ ] Check language-specific examples are appropriate
- [ ] Confirm compliance requirements match industry
- [ ] Validate tool recommendations align with existing setup
- [ ] Ensure documentation references point to actual files
EOF

# Create code-standards.md
cat > code-standards.md << 'EOF'
# Code Standards for AgentOS Projects

## 📝 CUSTOMIZATION REQUIRED
This template provides a foundation for code standards. You MUST customize it for your specific technology stack and project requirements.

## Overview
These standards ensure consistent, secure, and efficient code development across all AgentOS projects.

## Modern Development Standards

### 🔧 REPLACE: Update for Your Technology Stack
**Current Example: JavaScript - REPLACE WITH YOUR LANGUAGE**

#### Language-Specific Features
- **Variable Declarations**: Use `const` for immutable values, `let` for mutable variables
- **Functions**: Prefer arrow functions for concise syntax
- **Data Handling**: Use destructuring for cleaner code
- **String Handling**: Use template literals for string interpolation
- **Async Operations**: Prefer async/await over callbacks for better readability

```javascript
// EXAMPLE CODE - REPLACE WITH YOUR LANGUAGE EXAMPLES
const processUserData = async ({ userId, email, ...userData }) => {
  try {
    const validatedData = await validateInput({ userId, email, ...userData });
    const result = await UserService.save(validatedData);
    return { success: true, id: result.id };
  } catch (error) {
    Logger.error(`User processing failed: ${error.message}`);
    throw new ApplicationError('USER_PROCESS_FAILED', error.message, { userId, email });
  }
};
```

### 📋 CUSTOMIZE: Error Handling Standards
**Adapt these patterns to your technology and requirements:**

#### Custom Error Classes
- Implement error types specific to your domain (UserError, DatabaseError, etc.)
- Include relevant context information in error objects
- Implement retry mechanisms for transient failures appropriate to your system
- Provide graceful degradation for non-critical failures

#### Example Error Handling Pattern:
```javascript
// CUSTOMIZE THIS PATTERN FOR YOUR TECHNOLOGY
class ProjectError extends Error {
  constructor(code, message, context = {}) {
    super(message);
    this.name = 'ProjectError';
    this.code = code;
    this.context = context;
    this.timestamp = new Date().toISOString();
  }
}
```

### 🔒 ADAPT: Security Standards
**Modify based on your project's security requirements:**

- **Configuration Management**: Use secure configuration management appropriate for your platform
- **Input Validation**: Implement comprehensive input sanitization for your data types
- **Access Controls**: Enforce role-based access controls based on your user model
- **Audit Logging**: Maintain audit logs for all critical operations
- **Data Protection**: Ensure compliance with relevant regulations (GDPR, HIPAA, etc.)

### 📚 Documentation Standards
**Adjust documentation tools and formats for your stack:**

- **Code Documentation**: Use appropriate documentation tools for your language
- **Inline Comments**: Explain complex business logic and algorithms
- **README Files**: Maintain current documentation for each module
- **API Documentation**: Document all public interfaces using your preferred tools

### 🧪 Testing Standards
**Customize testing approach for your technology and project needs:**

- **Unit Testing**: Define target coverage appropriate for your project (e.g., 80%+)
- **Integration Testing**: Test all external integrations and dependencies
- **Performance Testing**: Validate response times and resource usage for your requirements
- **Security Testing**: Implement security assessments appropriate for your threat model

## 🎯 PROJECT-SPECIFIC CUSTOMIZATION CHECKLIST

### Required Customizations:
- [ ] Replace JavaScript examples with your technology stack
- [ ] Update error handling patterns for your platform
- [ ] Modify security standards for your compliance requirements
- [ ] Adapt testing frameworks to your technology
- [ ] Update documentation tools and formats
- [ ] Include domain-specific coding conventions
- [ ] Add performance requirements specific to your use case
- [ ] Include accessibility requirements if applicable

### Technology Stack Examples to Replace:
1. **Backend Technology**: [Replace with your backend framework]
2. **Frontend Technology**: [Replace with your frontend framework]
3. **Database Technology**: [Replace with your database solution]
4. **Testing Framework**: [Replace with your testing tools]
5. **Documentation Tools**: [Replace with your documentation system]

## 📋 Compliance and Industry Standards
**CUSTOMIZE: Add standards relevant to your industry**

Examples to consider:
- **Financial Services**: PCI DSS, SOX compliance
- **Healthcare**: HIPAA, HITECH compliance
- **Government**: FedRAMP, FISMA compliance
- **General**: ISO 27001, SOC 2 compliance

## 🔄 Continuous Improvement
- Regular review and update of standards
- Team feedback integration
- Industry best practices adoption
- Technology evolution adaptation
EOF

# Create project-config.md
cat > project-config.md << 'EOF'
# AgentOS Project Configuration

## 🤖 AI MODEL INSTRUCTIONS FOR PROJECT ANALYSIS

### Phase 1: Project Discovery
```
REQUIRED ANALYSIS TASKS:
1. Read parent directory files to understand project structure
2. Extract project information from README.md, package.json, etc.
3. Identify technology stack from dependencies and file types
4. Determine project type (web app, API, mobile, desktop, etc.)
5. Extract business context from documentation
6. Identify team structure from CONTRIBUTING.md or similar files
```

### Phase 2: Information Extraction Template
```
PROJECT METADATA EXTRACTION:
- Project Name: [Extract from package.json "name" field or README title]
- Description: [Extract from package.json "description" or README overview]
- Version: [Extract from package.json "version" or git tags]
- Repository: [Extract from package.json "repository" or git remote]
- License: [Extract from LICENSE file or package.json "license"]
- Author/Organization: [Extract from package.json "author" or README]
```

### Phase 3: Technology Stack Analysis
```
DEPENDENCY ANALYSIS RULES:
For package.json (Node.js):
  - Backend: Express, Koa, Fastify, NestJS, Next.js API
  - Frontend: React, Vue, Angular, Svelte
  - Database: mongoose (MongoDB), pg (PostgreSQL), mysql2
  - Testing: jest, mocha, cypress, playwright

For requirements.txt/pyproject.toml (Python):
  - Framework: Django, Flask, FastAPI, Pyramid
  - Database: psycopg2 (PostgreSQL), pymongo (MongoDB)
  - Testing: pytest, unittest, nose

For pom.xml/build.gradle (Java):
  - Framework: Spring Boot, Spring MVC, Quarkus
  - Database: JPA, Hibernate, MyBatis
  - Testing: JUnit, TestNG, Mockito

[Continue for other languages...]
```

## 🚨 CONFIGURATION REQUIRED
This is a template file. AI models should analyze the project and fill in all sections with discovered information.

## Project Overview
**🤖 AI TASK: Extract and fill project information from analysis**

### Discovered Project Information
```
PROJECT_NAME: [AI: Extract from package.json name or README title]
PROJECT_DESCRIPTION: [AI: Extract from README overview or package.json description]
PROJECT_TYPE: [AI: Determine from structure - Web App|Mobile App|API|Desktop|CLI|Library]
TARGET_USERS: [AI: Extract from README or infer from project type]
BUSINESS_DOMAIN: [AI: Infer from project name, description, and dependencies]
```

**AI-Generated Project Summary:**
This AgentOS configuration provides a comprehensive framework for AI agent coordination, development standards, and workflow management for **[AI: INSERT PROJECT_NAME]**.

**Project Description**: [AI: INSERT PROJECT_DESCRIPTION]

**Project Type**: [AI: INSERT PROJECT_TYPE]

**Target Users**: [AI: INSERT TARGET_USERS]

**Business Domain**: [AI: INSERT BUSINESS_DOMAIN]

## Agent OS Structure

### Core Configuration Files
**✅ These files will be created and need AI customization:**
- **Mission & Goals**: product/mission.md - [AI: UPDATE with extracted project mission]
- **Technical Specifications**: projects/project-spec.md - [AI: UPDATE with detected technical stack]
- **Development Standards**: code-standards.md - [AI: CUSTOMIZE for detected technology stack]
- **AI Guidelines**: ai-guidelines.md - [AI: ADAPT for detected development practices]

### Agent Configurations
**🤖 These agents can be customized based on detected team structure:**
- **Prompt Builder Agent**: agents/prompt-builder-agent.md
- **Requirements Analysis Agent**: agents/requirements-analysis-agent.md
- **Architecture Design Agent**: agents/architecture-design-agent.md
- **Task Manager Agent**: agents/task-manager-agent.md

## Detected System Architecture

### 🔧 AI-DETECTED: Technology Stack
**🤖 AI TASK: Fill based on dependency analysis**

```
TECHNOLOGY_DETECTION_RESULTS:
Backend: [AI: Detect from dependencies/file structure]
Frontend: [AI: Detect from dependencies/file structure]  
Database: [AI: Detect from dependencies/config files]
Cloud Platform: [AI: Detect from deployment configs]
APIs: [AI: Detect from external service integrations]
```

**Detected Technology Stack:**
- **Backend**: [AI: INSERT DETECTED_BACKEND]
- **Frontend**: [AI: INSERT DETECTED_FRONTEND]
- **Database**: [AI: INSERT DETECTED_DATABASE]
- **Cloud Platform**: [AI: INSERT DETECTED_CLOUD]
- **APIs**: [AI: INSERT DETECTED_APIS]

### 📋 AI-DETECTED: Development Workflow
**🤖 AI TASK: Adapt based on found CI/CD and development files**

```
WORKFLOW_DETECTION_RULES:
- Look for .github/workflows → GitHub Actions
- Look for .gitlab-ci.yml → GitLab CI
- Look for Jenkinsfile → Jenkins
- Look for test/ directory → Testing strategy
- Look for docs/ directory → Documentation approach
```

**Detected Development Workflow:**
1. **Requirements Analysis**: [AI: Describe based on found issue templates/docs]
2. **Architecture Design**: [AI: Describe based on found architecture docs]
3. **Implementation**: [AI: Describe based on found coding standards/style guides]
4. **Testing**: [AI: Describe based on detected testing framework]
5. **Deployment**: [AI: Describe based on detected CI/CD setup]

## 🎯 AI-GENERATED: Project-Specific Sections

### Business Context Analysis
**📈 AI TASK: Infer business context from project analysis**

```
BUSINESS_CONTEXT_INFERENCE:
- Industry: [Infer from project domain, dependencies, compliance requirements]
- Business Model: [Infer from project type and user base]
- Key Stakeholders: [Extract from CONTRIBUTING.md, README, or team docs]
- Success Metrics: [Infer from project goals and type]
```

**AI-Inferred Business Context:**
- **Industry**: [AI: INSERT INFERRED_INDUSTRY]
- **Business Model**: [AI: INSERT INFERRED_BUSINESS_MODEL]
- **Key Stakeholders**: [AI: INSERT EXTRACTED_STAKEHOLDERS]
- **Success Metrics**: [AI: INSERT INFERRED_SUCCESS_METRICS]

### Technical Context Analysis
**⚙️ AI TASK: Extract technical constraints from project**

```
TECHNICAL_CONSTRAINT_DETECTION:
- Performance Requirements: [Infer from project scale and type]
- Security Requirements: [Detect from security dependencies/configs]
- Integration Requirements: [Detect from external API usage]
- Scalability Requirements: [Infer from architecture and deployment setup]
```

**AI-Detected Technical Context:**
- **Performance Requirements**: [AI: INSERT DETECTED_PERFORMANCE_REQS]
- **Security Requirements**: [AI: INSERT DETECTED_SECURITY_REQS]
- **Integration Requirements**: [AI: INSERT DETECTED_INTEGRATION_REQS]
- **Scalability Requirements**: [AI: INSERT DETECTED_SCALABILITY_REQS]

### Team Context Analysis
**👥 AI TASK: Extract team information from project files**

```
TEAM_DETECTION_SOURCES:
- CONTRIBUTING.md → Team processes and guidelines
- .github/CODEOWNERS → Code ownership and team structure
- package.json contributors → Team members
- README.md maintainers → Project maintainers
- .github/ISSUE_TEMPLATE → Issue management process
```

**AI-Extracted Team Context:**
- **Team Size**: [AI: INSERT DETECTED_TEAM_SIZE]
- **Development Methodology**: [AI: INSERT DETECTED_METHODOLOGY]
- **Communication Tools**: [AI: INSERT DETECTED_COMMUNICATION_TOOLS]
- **Project Management Tools**: [AI: INSERT DETECTED_PM_TOOLS]

## Quality Assurance
**✅ AI-DETECTED: Current quality standards**
- Code reviews: [AI: DETECTED from PR templates/contributing guidelines]
- Testing pipeline: [AI: DETECTED from CI/CD configs]
- Performance monitoring: [AI: DETECTED from monitoring tools]
- Security assessments: [AI: DETECTED from security tools/dependencies]
- Documentation: [AI: DETECTED from docs structure]

## Success Metrics
**📊 AI-GENERATED: Project-specific success criteria**
- Development velocity: [AI: METRICS based on project type and scale]
- Code quality: [AI: METRICS based on detected testing/linting setup]
- System performance: [AI: METRICS based on performance requirements]
- User satisfaction: [AI: METRICS based on user base and project type]
- Business KPIs: [AI: METRICS specific to detected business domain]

## 🔄 AI Customization Checklist

### AI Model Validation Tasks:
- [ ] Project name and description extracted from README/package.json
- [ ] Technology stack accurately detected from dependencies
- [ ] Development workflow inferred from CI/CD and project structure
- [ ] Business context inferred from domain and project type
- [ ] Technical constraints identified from architecture and configs
- [ ] Team structure extracted from contributing guidelines
- [ ] Success metrics aligned with project goals and type
- [ ] Cross-references between AgentOS files are consistent
- [ ] All placeholder content has been replaced with real data

### Cross-File Consistency Check:
- [ ] Technology stack matches across all AgentOS files
- [ ] Business objectives align between mission.md and project-config.md
- [ ] Team processes consistent between ai-guidelines.md and project-config.md
- [ ] Success metrics aligned across mission.md and enhancement-roadmap.md

## 📋 AI Model Instructions Summary

1. **Read Project Files**: Analyze README.md, package.json, requirements.txt, etc.
2. **Extract Technology Stack**: Identify languages, frameworks, tools from dependencies
3. **Infer Business Context**: Determine industry, business model, stakeholders
4. **Detect Team Structure**: Find team size, processes, tools from contributing docs
5. **Update All Sections**: Replace all [AI: ...] placeholders with discovered information
6. **Validate Consistency**: Ensure information aligns across all AgentOS files
7. **Generate Summaries**: Create coherent project overviews based on analysis
EOF

# Create main README.md
cat > README.md << 'EOF'
# AgentOS Configuration

## 🚨 IMPORTANT: CUSTOMIZATION REQUIRED
This is a universal AgentOS template. You must customize all files with your project-specific information.

## Overview
This directory contains the complete AgentOS configuration providing AI agents with comprehensive guidelines, standards, and specifications for development and maintenance.

## 🎯 Quick Start Guide

### For Project Setup (FIRST TIME USERS)
1. **📋 Start Here**: Read this entire README for setup instructions
2. **🔧 Configure**: project-config.md - Update with your project details
3. **🎯 Define Mission**: product/mission.md - Add your project mission and goals
4. **⚙️ Tech Specs**: projects/project-spec.md - Add your technical specifications
5. **📝 Standards**: code-standards.md - Customize for your technology stack
6. **🤖 AI Setup**: ai-guidelines.md - Adapt for your development practices

### For AI Agents (AFTER CUSTOMIZATION)
1. **Start Here**: project-config.md - Complete project overview
2. **Mission & Goals**: product/mission.md - Project mission and objectives
3. **Development Guidelines**: ai-guidelines.md - AI-specific development guidelines
4. **Code Standards**: code-standards.md - Coding standards and best practices

### For Developers (ONGOING USE)
1. **Technical Specs**: projects/ - Complete technical specifications
2. **Enhancement Roadmap**: roadmap/enhancement-roadmap.md - Future development plans
3. **Agent Directory**: agents/ - All specialized agent configurations

## 📁 Directory Structure

```
.agent-os/
├── README.md                           # This file - main entry point
├── project-config.md                   # ⚠️ CUSTOMIZE: Project configuration
├── ai-guidelines.md                    # ⚠️ CUSTOMIZE: AI development guidelines
├── code-standards.md                   # ⚠️ CUSTOMIZE: Coding standards
├── product/
│   └── mission.md                     # ⚠️ CUSTOMIZE: Project mission
├── projects/
│   └── project-spec.md                # ⚠️ CUSTOMIZE: Technical specifications
├── agents/
│   ├── prompt-builder-agent.md        # 🔧 ADAPT: Core prompt engineering
│   ├── requirements-analysis-agent.md # 🔧 ADAPT: Requirements gathering
│   ├── architecture-design-agent.md   # 🔧 ADAPT: System architecture
│   └── task-manager-agent.md          # 🔧 ADAPT: Task management
├── prompts/
│   └── prompt-library.md              # 🔧 EXTEND: Prompt collection
├── frameworks/
│   └── context-engineering-framework.md # 📖 REFERENCE: Context management
├── roadmap/
│   └── enhancement-roadmap.md         # ⚠️ CUSTOMIZE: Development roadmap
└── templates/
    └── task-analysis-prompt.md        # 📖 REFERENCE: Task analysis template
```

## 🔧 Customization Guide

### Step 1: Project Foundation (REQUIRED)
**These files MUST be customized for your project:**

1. **project-config.md**: 
   - Update project name, description, and type
   - Define your technology stack
   - Specify development workflow
   - Add team and business context

2. **product/mission.md**: 
   - Write your project mission statement
   - Define business objectives and goals
   - List key stakeholders and their roles
   - Set success metrics and KPIs

3. **projects/project-spec.md**: 
   - Document functional requirements
   - Specify non-functional requirements
   - Define system architecture
   - List integration requirements

### Step 2: Development Standards (REQUIRED)
**Adapt these files to your technology and practices:**

4. **code-standards.md**: 
   - Replace JavaScript examples with your language
   - Update error handling patterns
   - Customize security standards
   - Define testing frameworks

5. **ai-guidelines.md**: 
   - Update technology-specific examples
   - Add domain-specific context
   - Customize prompt engineering approaches
   - Include compliance requirements

### Step 3: Agent Configuration (OPTIONAL)
**Customize agent roles based on your team needs:**

6. **agents/*.md files**: 
   - Modify agent responsibilities
   - Update deliverables and quality gates
   - Adapt to your team structure
   - Add domain-specific agents if needed

### Step 4: Roadmap Planning (RECOMMENDED)
**Plan your development phases:**

7. **roadmap/enhancement-roadmap.md**: 
   - Define development phases
   - Set timeline and milestones
   - Plan feature rollouts
   - Establish success metrics

## 🎯 Project Type Examples

### Web Application Projects
- Frontend: React/Vue/Angular + Backend API
- Database: PostgreSQL/MongoDB
- Deployment: AWS/Vercel/Netlify

### Mobile App Projects  
- Native: iOS (Swift) / Android (Kotlin)
- Cross-platform: React Native/Flutter
- Backend: Firebase/AWS/Custom API

### API/Microservices Projects
- Languages: Node.js/Python/Java/Go
- Architecture: REST/GraphQL/gRPC
- Containerization: Docker/Kubernetes

### Data/ML Projects
- Languages: Python/R/Scala
- Frameworks: TensorFlow/PyTorch/Spark
- Infrastructure: Jupyter/Airflow/MLflow

## 🚀 Getting Started Checklist

### Initial Setup (Complete in Order):
- [ ] Read this README completely
- [ ] Identify your project type and requirements
- [ ] Customize project-config.md with your project details
- [ ] Update product/mission.md with your mission and goals
- [ ] Fill in projects/project-spec.md with technical requirements
- [ ] Adapt code-standards.md to your technology stack
- [ ] Modify ai-guidelines.md for your development practices
- [ ] Configure agents in agents/ directory as needed
- [ ] Plan your roadmap in roadmap/enhancement-roadmap.md
- [ ] Test the setup with a small task

### Validation Checklist:
- [ ] All placeholder text has been replaced
- [ ] Technology stack is correctly specified
- [ ] Team roles and responsibilities are defined
- [ ] Success metrics are measurable and relevant
- [ ] Agent configurations match your team structure
- [ ] Documentation is complete and accurate

## 🛠️ Advanced Customization

### Adding New Agents
Create new agent files in `agents/` directory following this template:
```markdown
# [Agent Name]

## Agent Purpose
[Describe the agent's role and responsibilities]

## Core Responsibilities
[List main tasks and duties]

## Deliverables
[Specify expected outputs]

## Quality Gates
[Define success criteria]
```

### Custom Frameworks
Add project-specific frameworks in `frameworks/` directory for:
- Testing methodologies
- Deployment procedures
- Security protocols
- Performance monitoring

### Domain-Specific Prompts
Extend `prompts/prompt-library.md` with:
- Industry-specific prompts
- Technology-specific patterns
- Business domain language
- Compliance-focused prompts

## 📚 Usage Examples

### For Startups
Focus on rapid development, MVP delivery, and scalability planning.

### For Enterprise
Emphasize security, compliance, integration, and documentation.

### For Open Source
Prioritize community guidelines, contribution processes, and documentation.

### For Research Projects
Focus on experimentation, documentation, and reproducibility.

## ⚠️ Common Mistakes to Avoid

1. **Not customizing technology stack examples** - Replace all placeholder code
2. **Leaving mission statement generic** - Make it specific to your project
3. **Forgetting to update agent roles** - Adapt to your team structure
4. **Not defining success metrics** - Set measurable, achievable goals
5. **Skipping the roadmap** - Plan your development phases

## � Maintenance

### Regular Updates
- Review and update standards quarterly
- Adapt agent roles as team evolves
- Update roadmap based on progress
- Incorporate lessons learned

### Version Control
- Track changes to configuration files
- Document reasons for modifications
- Maintain backward compatibility
- Archive deprecated configurations

---

*This AgentOS configuration ensures consistent, high-quality development aligned with your specific business objectives and technical requirements.*
EOF

echo "🤖 Creating agent configurations..."

# Create agents/prompt-builder-agent.md
cat > agents/prompt-builder-agent.md << 'EOF'
# Prompt Builder Agent

## Agent Purpose
The Prompt Builder Agent is responsible for creating, optimizing, and managing prompts for all other agents in the project workflow, ensuring contextually rich and effective agent communication.

## Core Responsibilities

### 1. Prompt Engineering & Design
- Create task-specific prompts for each agent
- Integrate relevant business and technical context
- Optimize prompts based on agent performance
- Develop reusable prompt templates

### 2. Context Integration
- Incorporate project specifications and requirements
- Include stakeholder context and constraints
- Maintain alignment with development standards
- Ensure security and compliance considerations

### 3. Quality Assurance
- Test prompts with various scenarios
- Monitor prompt effectiveness and agent responses
- Implement continuous improvement processes
- Establish prompt engineering best practices

## Prompt Templates

### Task Analysis Template
```markdown
As the [AGENT_NAME] for this project, analyze and implement the following task:

**Context Integration:**
- Business Context: [Project mission and objectives]
- Technical Context: [Architecture and constraints]
- Quality Standards: [Development standards and guidelines]

**Task Specifications:**
- Objective: [Clear task objective]
- Requirements: [Specific requirements]
- Success Criteria: [Measurable outcomes]

**Implementation Guidelines:**
- Follow established coding standards
- Implement comprehensive error handling
- Include security best practices
- Document all code and decisions

**Deliverables:**
1. [Specific deliverable 1]
2. [Specific deliverable 2]
3. [Quality assurance validation]
```

## Performance Metrics
- Agent response quality scores
- Task completion rates
- Response accuracy measurements
- Prompt clarity feedback
EOF

# Create agents/requirements-analysis-agent.md
cat > agents/requirements-analysis-agent.md << 'EOF'
# Requirements Analysis Agent

## Agent Purpose
Specialized in gathering, analyzing, and documenting project requirements from stakeholders, ensuring comprehensive understanding of business needs and technical constraints.

## Core Responsibilities

### 1. Stakeholder Engagement
- Conduct structured requirement gathering sessions
- Interview key stakeholders and subject matter experts
- Facilitate requirement clarification and validation
- Manage requirement changes and updates

### 2. Requirement Documentation
- Create detailed functional requirements
- Document non-functional requirements
- Establish acceptance criteria and success metrics
- Maintain requirement traceability matrix

### 3. Analysis & Validation
- Analyze requirement dependencies and conflicts
- Validate feasibility with technical constraints
- Assess business impact and priority
- Identify gaps and missing requirements

## Deliverables

### Requirement Documentation
- Functional requirement specifications
- Non-functional requirement analysis
- User story mapping and scenarios
- Acceptance criteria definition

### Analysis Reports
- Requirement feasibility assessment
- Risk analysis and mitigation strategies
- Priority matrix and roadmap alignment
- Stakeholder impact analysis

## Quality Gates
- Stakeholder validation and sign-off
- Technical feasibility confirmation
- Business value assessment
- Completeness and consistency verification
EOF

# Create agents/architecture-design-agent.md
cat > agents/architecture-design-agent.md << 'EOF'
# Architecture Design Agent

## Agent Purpose
Responsible for designing scalable, maintainable, and secure system architecture based on project requirements and technical constraints.

## Core Responsibilities

### 1. System Design
- Design overall system architecture
- Define component interactions and interfaces
- Establish data flow and integration patterns
- Plan for scalability and performance

### 2. Technical Decision Making
- Evaluate technology stack options
- Make architectural trade-off decisions
- Define development and deployment strategies
- Establish quality attributes and constraints

### 3. Documentation & Communication
- Create architectural diagrams and documentation
- Communicate design decisions to development teams
- Provide technical guidance and best practices
- Maintain architectural standards and guidelines

## Deliverables

### Architecture Documentation
- System architecture diagrams
- Component design specifications
- API design and integration patterns
- Data architecture and modeling

### Technical Guidelines
- Development standards and best practices
- Security architecture and requirements
- Performance optimization strategies
- Deployment and infrastructure planning

## Quality Gates
- Architecture review and validation
- Technical feasibility assessment
- Security and compliance verification
- Performance and scalability analysis
EOF

# Create agents/task-manager-agent.md
cat > agents/task-manager-agent.md << 'EOF'
# Task Manager Agent

## Agent Purpose
Coordinates task planning, execution, and tracking across all agents, ensuring efficient workflow management and quality delivery.

## Core Responsibilities

### 1. Task Planning & Coordination
- Break down complex projects into manageable tasks
- Assign tasks to appropriate specialized agents
- Manage task dependencies and sequencing
- Monitor progress and identify bottlenecks

### 2. Quality Assurance
- Implement quality gates and checkpoints
- Coordinate code reviews and testing
- Ensure compliance with standards and guidelines
- Manage risk mitigation and issue resolution

### 3. Communication & Reporting
- Facilitate inter-agent communication
- Provide progress updates and status reports
- Coordinate stakeholder communication
- Maintain project documentation and knowledge base

## Task Management Framework

### Task Breakdown Structure
- Epic-level project objectives
- Feature-level functional components
- Story-level implementation tasks
- Subtask-level technical activities

### Quality Gates
- Requirements validation checkpoints
- Design review and approval gates
- Implementation quality verification
- Testing and acceptance validation

## Deliverables

### Project Planning
- Task breakdown and scheduling
- Resource allocation and assignment
- Risk assessment and mitigation plans
- Quality assurance strategy

### Progress Tracking
- Status reports and dashboards
- Performance metrics and KPIs
- Issue tracking and resolution
- Stakeholder communication updates
EOF

echo "🎯 Creating framework configurations..."

# Create frameworks/context-engineering-framework.md
cat > frameworks/context-engineering-framework.md << 'EOF'
# Context Engineering Framework

## Overview
The Context Engineering Framework provides structured methodologies for capturing, managing, and distributing contextual information across all agents in the project workflow.

## Framework Architecture

### Context Categories

#### 1. Business Context
- Domain knowledge and business processes
- Stakeholder requirements and objectives
- Success metrics and quality standards
- Compliance and regulatory requirements

#### 2. Technical Context
- Platform constraints and limitations
- Architecture decisions and patterns
- Technology stack and integrations
- Performance and security requirements

#### 3. Project Context
- Development methodology and workflow
- Team structure and responsibilities
- Timeline and milestone planning
- Resource allocation and constraints

## Context Engineering Process

### Phase 1: Context Identification
- Identify all relevant context sources
- Categorize context by type and relevance
- Establish context priorities and dependencies
- Define context validation criteria

### Phase 2: Context Capture
- Gather context from multiple sources
- Document context in structured formats
- Validate context accuracy and completeness
- Establish context maintenance procedures

### Phase 3: Context Distribution
- Package context for agent consumption
- Implement context delivery mechanisms
- Monitor context usage and effectiveness
- Update context based on feedback

## Quality Assurance

### Context Validation
- Multi-source verification
- Stakeholder confirmation
- Technical feasibility assessment
- Consistency checking

### Continuous Improvement
- Regular context reviews and updates
- Feedback integration and analysis
- Performance monitoring and optimization
- Best practice development and sharing
EOF

echo "📋 Creating product and project specifications..."

# Create product/mission.md
cat > product/mission.md << 'EOF'
# Project Mission & Vision

## 🤖 AI MODEL INSTRUCTIONS FOR MISSION ANALYSIS

### Phase 1: Mission Discovery Process
```
MISSION_EXTRACTION_WORKFLOW:
1. Analyze README.md for project vision and goals
2. Extract purpose statements from documentation
3. Identify value propositions from marketing/product docs
4. Determine target audience from user docs or personas
5. Infer business objectives from project structure and dependencies
6. Extract success criteria from existing metrics or KPIs
```

### Phase 2: Mission Analysis Patterns
```
MISSION_PATTERN_DETECTION:
Purpose Statements: Look for phrases like:
  - "This project aims to..."
  - "Our mission is to..."
  - "We are building..."
  - "The goal of this project..."
  
Value Propositions: Look for:
  - Problem statements in README
  - Solutions offered
  - Benefits to users
  - Competitive advantages

Target Audience: Extract from:
  - User documentation
  - API documentation audience
  - Contributing guidelines target contributors
  - Example use cases
```

### Phase 3: AI Mission Content Generation
```
CONTENT_GENERATION_RULES:
1. Synthesize a clear, actionable mission statement
2. Identify 3-5 key objectives based on project analysis
3. Define success metrics aligned with project type
4. Map stakeholders based on project scale and domain
5. Generate value propositions from feature analysis
6. Create timeline based on development activity and releases
```

## 🚨 MISSION CONFIGURATION REQUIRED
AI models should analyze the project and automatically fill in this mission template.

## 🎯 AI-GENERATED: Mission Statement

### Core Mission
**🤖 AI TASK: Generate mission statement from project analysis**

```
MISSION_SYNTHESIS_TEMPLATE:
Based on project analysis, generate a mission that captures:
- Primary purpose of the project
- Value delivered to users
- Impact on the target domain
- Long-term vision for the project
```

**AI-Generated Mission:**
Our mission is to [AI: SYNTHESIZE from project purpose and value proposition found in documentation].

**AI-Extracted Project Purpose:**
[AI: EXTRACT and SYNTHESIZE the main purpose from README, package.json description, and documentation overview]

## 🎯 AI-DETECTED: Strategic Objectives

### Primary Objectives
**🤖 AI TASK: Extract objectives from project goals and documentation**

```
OBJECTIVE_DETECTION_SOURCES:
- Project roadmap files
- GitHub issues and milestones
- README feature lists
- Package.json scripts (indicates development focus)
- Contribution guidelines (indicates project priorities)
```

**AI-Generated Strategic Objectives:**

1. **[AI: OBJECTIVE_1]**: [AI: DESCRIPTION based on primary project features]
   - **Success Metric**: [AI: DEFINE metric based on objective type]
   - **Timeline**: [AI: ESTIMATE based on project activity and scope]

2. **[AI: OBJECTIVE_2]**: [AI: DESCRIPTION based on technical requirements]
   - **Success Metric**: [AI: DEFINE metric based on technical goals]
   - **Timeline**: [AI: ESTIMATE based on development complexity]

3. **[AI: OBJECTIVE_3]**: [AI: DESCRIPTION based on user experience goals]
   - **Success Metric**: [AI: DEFINE metric based on user-facing features]
   - **Timeline**: [AI: ESTIMATE based on feature scope]

4. **[AI: OBJECTIVE_4]**: [AI: DESCRIPTION based on quality and maintenance goals]
   - **Success Metric**: [AI: DEFINE metric based on quality standards]
   - **Timeline**: [AI: ESTIMATE based on project maturity]

## 👥 AI-DETECTED: Stakeholder Alignment

### Primary Stakeholders
**🤖 AI TASK: Identify stakeholders from project context**

```
STAKEHOLDER_DETECTION_PATTERNS:
Internal Stakeholders:
- Development team (from CONTRIBUTORS, AUTHORS)
- Product owners (from project leadership docs)
- DevOps/Infrastructure (from deployment configs)

External Stakeholders:
- End users (from user documentation target audience)
- API consumers (from API documentation)
- Open source community (from contribution guidelines)
- Business customers (from business domain analysis)
```

**AI-Identified Stakeholders:**

- **[AI: STAKEHOLDER_TYPE_1]**: [AI: IDENTIFY from project analysis]
  - **Interest**: [AI: DESCRIBE their stake in the project]
  - **Success Criteria**: [AI: DEFINE what success means to them]

- **[AI: STAKEHOLDER_TYPE_2]**: [AI: IDENTIFY from development context]
  - **Interest**: [AI: DESCRIBE their technical requirements]
  - **Success Criteria**: [AI: DEFINE technical success metrics]

- **[AI: STAKEHOLDER_TYPE_3]**: [AI: IDENTIFY from business context]
  - **Interest**: [AI: DESCRIBE their business requirements]
  - **Success Criteria**: [AI: DEFINE business success metrics]

## 📈 AI-GENERATED: Value Propositions

### Core Value Propositions
**🤖 AI TASK: Extract value propositions from feature analysis**

```
VALUE_PROPOSITION_ANALYSIS:
Technical Value: Analyze from:
- Performance improvements mentioned in docs
- Developer experience features
- Integration capabilities
- Scalability features

Business Value: Analyze from:
- Cost savings mentioned
- Efficiency improvements
- Revenue generation potential
- Market advantages

User Value: Analyze from:
- User experience improvements
- Problem-solving capabilities
- Time savings for users
- Ease of use features
```

**AI-Generated Value Propositions:**

1. **[AI: VALUE_PROP_1]**: [AI: EXTRACT technical value from feature analysis]
   - **Benefit**: [AI: QUANTIFY the benefit where possible]
   - **Target**: [AI: IDENTIFY who benefits most]

2. **[AI: VALUE_PROP_2]**: [AI: EXTRACT business value from project impact]
   - **Benefit**: [AI: DESCRIBE business impact]
   - **Target**: [AI: IDENTIFY business stakeholders]

3. **[AI: VALUE_PROP_3]**: [AI: EXTRACT user value from UX features]
   - **Benefit**: [AI: DESCRIBE user experience improvement]
   - **Target**: [AI: IDENTIFY target users]

## 🔄 AI-GENERATED: Success Framework

### Success Metrics by Category
**🤖 AI TASK: Define metrics based on project type and objectives**

```
METRICS_GENERATION_RULES:
Technical Metrics: Based on project type:
- Web apps: Performance, uptime, response times
- APIs: Throughput, latency, error rates
- Libraries: Adoption, performance benchmarks
- CLI tools: Execution time, ease of use

Business Metrics: Based on domain:
- E-commerce: Conversion rates, transaction volume
- SaaS: User adoption, retention, revenue
- Internal tools: Productivity improvements, cost savings

Quality Metrics: Universal:
- Code coverage, bug rates, security scores
- Documentation completeness, user satisfaction
```

**AI-Defined Success Metrics:**

#### Technical Success
- **[AI: TECHNICAL_METRIC_1]**: [AI: DEFINE based on project type] → Target: [AI: SET realistic target]
- **[AI: TECHNICAL_METRIC_2]**: [AI: DEFINE based on performance requirements] → Target: [AI: SET performance target]
- **[AI: TECHNICAL_METRIC_3]**: [AI: DEFINE based on quality standards] → Target: [AI: SET quality target]

#### Business Success
- **[AI: BUSINESS_METRIC_1]**: [AI: DEFINE based on business objectives] → Target: [AI: SET business target]
- **[AI: BUSINESS_METRIC_2]**: [AI: DEFINE based on stakeholder value] → Target: [AI: SET stakeholder target]

#### User Success
- **[AI: USER_METRIC_1]**: [AI: DEFINE based on user experience goals] → Target: [AI: SET user satisfaction target]
- **[AI: USER_METRIC_2]**: [AI: DEFINE based on user adoption] → Target: [AI: SET adoption target]

## 🗓️ AI-GENERATED: Mission Timeline

### Development Phases
**🤖 AI TASK: Create timeline based on project analysis and scope**

```
TIMELINE_ESTIMATION_FACTORS:
- Current project maturity (analyze git history, version numbers)
- Scope of remaining work (analyze TODO comments, issues, roadmap)
- Team size and velocity (analyze commit frequency, contributor count)
- Technical complexity (analyze dependency complexity, architecture)
```

**AI-Generated Development Timeline:**

#### Phase 1: [AI: PHASE_1_NAME] ([AI: DURATION_ESTIMATE])
**Focus**: [AI: PRIMARY_FOCUS based on current state analysis]
- **Key Objectives**: [AI: LIST 2-3 key objectives for this phase]
- **Success Criteria**: [AI: DEFINE measurable criteria]
- **Deliverables**: [AI: LIST concrete deliverables]

#### Phase 2: [AI: PHASE_2_NAME] ([AI: DURATION_ESTIMATE])
**Focus**: [AI: NEXT_PRIORITY based on project roadmap]
- **Key Objectives**: [AI: LIST 2-3 key objectives for this phase]
- **Success Criteria**: [AI: DEFINE measurable criteria]
- **Deliverables**: [AI: LIST concrete deliverables]

#### Phase 3: [AI: PHASE_3_NAME] ([AI: DURATION_ESTIMATE])
**Focus**: [AI: LONG_TERM_GOALS based on project vision]
- **Key Objectives**: [AI: LIST 2-3 key objectives for this phase]
- **Success Criteria**: [AI: DEFINE measurable criteria]
- **Deliverables**: [AI: LIST concrete deliverables]

## 🎯 AI Mission Validation Checklist

### AI Model Validation Tasks:
- [ ] Mission statement clearly derived from project purpose in documentation
- [ ] Strategic objectives align with detected project features and goals
- [ ] Stakeholders identified from actual project context and team structure
- [ ] Value propositions match demonstrated project capabilities
- [ ] Success metrics appropriate for detected project type and scale
- [ ] Timeline realistic based on project complexity and team capacity
- [ ] All sections contain specific, actionable content (no generic placeholders)
- [ ] Mission aligns with technical capabilities found in codebase analysis
- [ ] Business objectives match inferred domain and target audience
- [ ] Stakeholder interests align with project scope and impact

### Cross-Reference Validation:
- [ ] Mission objectives align with project-config.md strategic goals
- [ ] Success metrics consistent across mission.md and project-config.md
- [ ] Stakeholder alignment matches team structure in other AgentOS files
- [ ] Timeline phases match development workflow in project-config.md
- [ ] Value propositions align with technical capabilities in ai-guidelines.md

## 📋 AI Analysis Summary Instructions

**For AI Models Processing This File:**

1. **Extract Project Context**: Read README.md, package.json, and documentation to understand project purpose
2. **Synthesize Mission**: Create a clear, specific mission statement based on project analysis
3. **Generate Objectives**: Identify 3-5 strategic objectives from project features and goals
4. **Map Stakeholders**: Identify stakeholders from team docs, user docs, and project context
5. **Define Value**: Extract value propositions from feature analysis and problem statements
6. **Set Metrics**: Define success metrics appropriate for project type and domain
7. **Create Timeline**: Estimate realistic timeline based on project complexity and current state
8. **Validate Coherence**: Ensure all sections work together as a cohesive mission framework
9. **Cross-Check**: Verify alignment with other AgentOS configuration files
10. **Replace Placeholders**: Ensure no [AI: ...] tags remain after processing
EOF

# Create projects/project-spec.md
cat > projects/project-spec.md << 'EOF'
# Project Technical Specification

## Overview
[Customize this section with your project's technical overview]

This document outlines the technical specifications for [project name], including functional requirements, system architecture, and implementation details.

## Functional Requirements

### Core Features
- **[Feature 1]**: [Detailed description of feature and functionality]
- **[Feature 2]**: [Detailed description of feature and functionality]
- **[Feature 3]**: [Detailed description of feature and functionality]

### User Workflows
- **[Workflow 1]**: [Step-by-step process description]
- **[Workflow 2]**: [Step-by-step process description]
- **[Workflow 3]**: [Step-by-step process description]

## Non-Functional Requirements

### Performance
- Response time: [target response times]
- Throughput: [transaction volume requirements]
- Scalability: [growth and scaling requirements]

### Security
- Authentication: [authentication requirements]
- Authorization: [access control requirements]
- Data Protection: [data security and privacy requirements]

### Reliability
- Availability: [uptime requirements]
- Recovery: [disaster recovery requirements]
- Monitoring: [system monitoring requirements]

## Technical Architecture

### Technology Stack
- **Backend**: [Backend technology and framework]
- **Frontend**: [Frontend technology and framework]
- **Database**: [Database technology and design]
- **APIs**: [API specifications and integrations]

### System Components
- **[Component 1]**: [Purpose and responsibilities]
- **[Component 2]**: [Purpose and responsibilities]
- **[Component 3]**: [Purpose and responsibilities]

## Integration Requirements
- **[Integration 1]**: [External system and interface details]
- **[Integration 2]**: [External system and interface details]
- **[Integration 3]**: [External system and interface details]

## Quality Standards
- Code coverage: [target percentage]
- Performance benchmarks: [specific metrics]
- Security compliance: [standards and requirements]
- Documentation requirements: [documentation standards]
EOF

echo "📈 Creating roadmap and templates..."

# Create roadmap/enhancement-roadmap.md
cat > roadmap/enhancement-roadmap.md << 'EOF'
# Enhancement Roadmap

## Overview
This roadmap provides strategic guidance for the comprehensive development and enhancement of the project, transforming it into a robust, scalable, and feature-rich system.

## Development Phases

### Phase 1: Foundation (Weeks 1-4)
**Focus**: Establish solid foundation and core functionality

#### Key Deliverables
- Core system architecture implementation
- Basic functionality development
- Initial testing framework
- Documentation foundation

#### Business Impact
- Functional baseline system
- Reduced technical debt
- Improved development velocity
- Enhanced code quality

### Phase 2: Enhancement (Weeks 5-8)
**Focus**: User experience and performance optimization

#### Key Deliverables
- User interface improvements
- Performance optimizations
- Advanced features implementation
- Comprehensive testing

#### Business Impact
- Improved user satisfaction
- Better system performance
- Enhanced feature set
- Increased reliability

### Phase 3: Scale & Optimize (Weeks 9-12)
**Focus**: Scalability and advanced capabilities

#### Key Deliverables
- Scalability enhancements
- Advanced integrations
- Analytics and reporting
- Security improvements

#### Business Impact
- Support for growth
- Better insights and reporting
- Enhanced security posture
- Operational efficiency

## Implementation Guidelines

### Development Standards
- Follow established coding standards
- Implement comprehensive testing
- Maintain thorough documentation
- Regular code reviews and quality gates

### Quality Assurance
- Automated testing pipeline
- Performance monitoring
- Security assessments
- User acceptance testing

## Success Metrics

### Technical Metrics
- Code quality improvements
- Performance enhancements
- System reliability
- Security compliance

### Business Metrics
- User adoption rates
- Operational efficiency gains
- Cost reduction achievements
- Stakeholder satisfaction
EOF

# Create templates/task-analysis-prompt.md
cat > templates/task-analysis-prompt.md << 'EOF'
# Task Analysis Template

## Overview
This template provides a structured approach for analyzing tasks within the project, ensuring comprehensive understanding and effective execution aligned with project standards.

## Task Analysis Framework

### 1. Initial Task Assessment

#### Task Understanding
```
**Task Title**: [Brief, descriptive title]
**Task Category**: [Development | Enhancement | Bug Fix | Documentation]
**Priority Level**: [High | Medium | Low]
**Estimated Complexity**: [Simple | Moderate | Complex]
**Dependencies**: [List any prerequisites]
```

#### Context Analysis
```
**Business Context**: 
- What business problem does this task solve?
- How does it align with project mission?
- What is the expected business impact?

**Technical Context**:
- Which system components are affected?
- What existing functionality needs modification?
- Are there any technical constraints?

**User Impact**:
- Who are the end users affected?
- How will this improve user experience?
- Any potential risks to consider?
```

### 2. Requirements Analysis

#### Functional Requirements
```
**Core Functionality**:
1. [Requirement 1 - specific, measurable]
2. [Requirement 2 - specific, measurable]
3. [Requirement 3 - specific, measurable]

**Input/Output Specifications**:
- Input: [Data format, validation rules]
- Processing: [Business logic, transformations]
- Output: [Expected results, format]
```

#### Non-Functional Requirements
```
**Performance**:
- Response time targets
- Throughput requirements
- Resource constraints

**Security**:
- Data protection requirements
- Access control needs
- Compliance considerations

**Reliability**:
- Error handling requirements
- Fallback mechanisms
- Recovery procedures
```

### 3. Implementation Planning

#### Technical Approach
```
**Development Strategy**:
1. [Step 1 - specific action]
2. [Step 2 - specific action]
3. [Step 3 - specific action]

**Risk Assessment**:
- Technical risks and mitigation
- Business risks and impact
- Dependencies and blockers

**Testing Strategy**:
- Unit testing approach
- Integration testing needs
- Acceptance criteria
```

### 4. Quality Assurance

#### Acceptance Criteria
```
**Functional Criteria**:
- [ ] [Criterion 1 - specific, testable]
- [ ] [Criterion 2 - specific, testable]
- [ ] [Criterion 3 - specific, testable]

**Technical Criteria**:
- [ ] Code follows established standards
- [ ] Performance meets requirements
- [ ] Security measures implemented
- [ ] Documentation complete
```

## Implementation Checklist

### Pre-Implementation
```
- [ ] Task analysis completed
- [ ] Requirements validated
- [ ] Dependencies resolved
- [ ] Test plan defined
```

### During Implementation
```
- [ ] Follow coding standards
- [ ] Implement error handling
- [ ] Add appropriate logging
- [ ] Write unit tests
- [ ] Update documentation
```

### Post-Implementation
```
- [ ] All tests passing
- [ ] Code review completed
- [ ] Performance validated
- [ ] Documentation updated
```

## Reference Documents
Always consult:
- project-config.md - Project overview
- mission.md - Project goals
- code-standards.md - Development standards
- ai-guidelines.md - AI development practices
EOF

echo "🔧 Creating additional agent files..."

# Create remaining agent files with basic content
cat > agents/baseservice-resolution-agent.md << 'EOF'
# Base Service Resolution Agent

## Purpose
Handles service resolution and dependency injection for the project architecture.

## Responsibilities
- Service registration and discovery
- Dependency resolution
- Service lifecycle management
- Configuration management

## Implementation Guidelines
- Follow dependency injection patterns
- Implement service interfaces
- Maintain service registry
- Handle service failures gracefully
EOF

cat > agents/codebase.md << 'EOF'
# Codebase Analysis Agent

## Purpose
Analyzes existing codebase for patterns, issues, and improvement opportunities.

## Responsibilities
- Code quality assessment
- Architecture analysis
- Technical debt identification
- Refactoring recommendations

## Analysis Areas
- Code complexity metrics
- Design pattern usage
- Performance bottlenecks
- Security vulnerabilities
EOF

# Create prompt library
cat > prompts/prompt-library.md << 'EOF'
# Prompt Library

## Overview
Comprehensive collection of prompts for various development tasks and agent interactions.

## Development Prompts

### Code Analysis
```
Analyze the following code for [specific aspect]:
- Code quality and best practices
- Performance optimization opportunities
- Security vulnerabilities
- Architectural improvements

Consider the project context and requirements when providing recommendations.
```

### Feature Implementation
```
Implement [feature description] with the following requirements:
- [Requirement 1]
- [Requirement 2]
- [Requirement 3]

Follow established coding standards and include comprehensive error handling.
```

## Quality Assurance Prompts

### Testing
```
Create comprehensive tests for [component/feature]:
- Unit tests for core functionality
- Integration tests for external dependencies
- Edge case validation
- Performance testing scenarios
```

### Code Review
```
Review the following code changes:
- Compliance with coding standards
- Security best practices
- Performance implications
- Documentation completeness
```

## Documentation Prompts

### Technical Documentation
```
Create technical documentation for [component/system]:
- Overview and purpose
- Architecture and design decisions
- API specifications
- Usage examples and best practices
```
EOF

echo "✅ Creating final configuration files..."

# Create context-engineering-expert files
mkdir -p prompts/context-engineering-expert/extensions

cat > prompts/context-engineering-expert/README.md << 'EOF'
# Context Engineering Expert

## Overview
Advanced context engineering capabilities for complex project analysis and implementation.

## Components
- Analysis criteria and methodologies
- Deliverable specifications
- Implementation patterns
- Quality gates and validation
- Research methodologies
- Technical specifications

## Extensions
- Current state analysis tools
- Improvement roadmap planning
- Web research methodologies
EOF

cat > prompts/context-engineering-expert/main-prompt.md << 'EOF'
# Context Engineering Expert - Main Prompt

## Purpose
Provides comprehensive context engineering capabilities for project analysis and implementation planning.

## Capabilities
- Multi-dimensional context analysis
- Stakeholder requirement integration
- Technical constraint assessment
- Implementation roadmap development

## Usage Guidelines
- Integrate business and technical context
- Consider stakeholder perspectives
- Validate against project constraints
- Provide actionable recommendations
EOF

# Create emergency prompts
cat > prompts/emergency/emergency-001-class-loading-agent.md << 'EOF'
# Emergency Class Loading Agent

## Purpose
Handles critical class loading and module resolution issues.

## Emergency Procedures
- Identify class loading failures
- Resolve dependency conflicts
- Implement fallback mechanisms
- Restore system functionality

## Escalation Path
- Immediate assessment
- Quick resolution implementation
- System validation
- Post-incident analysis
EOF

# Set permissions
chmod +x setup_agentos.sh

cd ..

echo ""
echo "🎉 AgentOS Universal Setup completed successfully!"
echo ""
echo "📁 Directory structure created in .agent-os/"
echo "📝 All template files created with customization instructions"
echo "🚀 Ready for project-specific customization"
echo ""
echo "🚨 IMPORTANT: This is a TEMPLATE that requires customization!"
echo ""
echo "📋 IMMEDIATE NEXT STEPS (REQUIRED):"
echo "1. 📝 Open .agent-os/README.md and read the complete customization guide"
echo "2. 🔧 Customize .agent-os/project-config.md with your project details"
echo "3. 🎯 Fill out .agent-os/product/mission.md with your project mission"
echo "4. ⚙️ Update .agent-os/projects/project-spec.md with technical specifications"
echo "5. 🔧 Adapt .agent-os/code-standards.md to your technology stack"
echo "6. 🤖 Modify .agent-os/ai-guidelines.md for your development practices"
echo ""
echo "📖 DETAILED GUIDANCE:"
echo "• See .agent-os/README.md for complete setup instructions"
echo "• Each file contains detailed customization instructions"
echo "• Look for 🚨 CUSTOMIZATION REQUIRED sections in all files"
echo "• Follow the step-by-step checklist in each template"
echo ""
echo "🎯 PROJECT TYPES SUPPORTED:"
echo "• Web Applications (React, Vue, Angular + Backend)"
echo "• Mobile Apps (React Native, Flutter, Native iOS/Android)"
echo "• API/Microservices (Node.js, Python, Java, Go)"
echo "• Data/ML Projects (Python, R, Jupyter, MLflow)"
echo "• Desktop Applications (Electron, .NET, Java)"
echo ""
echo "⚠️  REMEMBER: Replace ALL placeholder content with your project information!"
echo ""
echo "📚 For help: Check the examples and instructions in each file"
