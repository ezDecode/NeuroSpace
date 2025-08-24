// Test design system imports
const designSystem = require('./src/lib/design-system.js');

console.log('Testing design system exports...');
console.log('componentClasses:', designSystem.componentClasses ? 'OK' : 'UNDEFINED');
console.log('designTokens:', designSystem.designTokens ? 'OK' : 'UNDEFINED');
console.log('getCardClass:', designSystem.getCardClass ? 'OK' : 'UNDEFINED');
console.log('getButtonClass:', designSystem.getButtonClass ? 'OK' : 'UNDEFINED');

if (designSystem.componentClasses) {
  console.log('componentClasses.layout:', designSystem.componentClasses.layout ? 'OK' : 'UNDEFINED');
  console.log('componentClasses.icon:', designSystem.componentClasses.icon ? 'OK' : 'UNDEFINED');
  if (designSystem.componentClasses.layout) {
    console.log('componentClasses.layout.page:', designSystem.componentClasses.layout.page ? 'OK' : 'UNDEFINED');
    console.log('componentClasses.layout.gridStats:', designSystem.componentClasses.layout.gridStats ? 'OK' : 'UNDEFINED');
  }
}

if (designSystem.designTokens) {
  console.log('designTokens.typography:', designSystem.designTokens.typography ? 'OK' : 'UNDEFINED');
  if (designSystem.designTokens.typography) {
    console.log('designTokens.typography.h1:', designSystem.designTokens.typography.h1 ? 'OK' : 'UNDEFINED');
  }
}
