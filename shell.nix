{ pkgs ? import <nixpkgs> {} }:
let
  pyEnv = pkgs.python312.withPackages (ps: with ps; [
    mkdocs
  ]);
in
  pkgs.mkShellNoCC {
  packages = with pkgs; [
    nodejs_22 # Node JS
    corepack_22 # Needed for pnpm
    nodejs_22.pkgs.pnpm
    npm-check-updates # Update node dependencies
    pyEnv # Python environment
    shellcheck # Shell script linter
    shfmt # Shell script formatter
  ];
}
