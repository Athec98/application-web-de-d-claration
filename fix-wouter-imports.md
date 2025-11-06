# Corrections à faire manuellement

Les fichiers suivants utilisent encore `wouter` au lieu de `react-router-dom`:

1. **NotFound.tsx** - Remplacer `setLocation` par `navigate`
2. **ParentProfile.tsx** - Remplacer `setLocation` par `navigate`  
3. **ParentDashboard.tsx** - Remplacer `setLocation` par `navigate`
4. **MairieDashboard.tsx** - Remplacer `setLocation` par `navigate`
5. **HopitalDashboard.tsx** - Remplacer `setLocation` par `navigate`
6. **NewDeclaration.tsx** - Remplacer `setLocation` par `navigate`
7. **Payment.tsx** - Remplacer `setLocation` par `navigate`
8. **Home.tsx** - Remplacer `<Streamdown>` par `<div>`

Tous ces fichiers doivent:
- Importer `useNavigate` au lieu de `useLocation` de `react-router-dom`
- Utiliser `const navigate = useNavigate()` au lieu de `const [, setLocation] = useLocation()`
- Remplacer `setLocation('/path')` par `navigate('/path')`

