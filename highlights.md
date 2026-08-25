# Highlights

## Publications & Articles

### 2026

<div class="highlight">
 | Learning features from Newton's algorithm: a way to accelerate nonlinear parametrized PDE solvers | 
 Rémy Vallot, 
 <a href="https://fdevuyst.jimdofree.com/" class="supervisor">Florian De Vuyst</a>, 
 <a href="https://scholar.google.com/citations?user=L_eRA6YAAAAJ&hl=en" class="supervisor">Thibault Dairay </a>,
 <a href="https://sites.google.com/site/mougeotmathilde/" class="supervisor">Mathilde Mougeot</a>
 | | arxiv:https://arxiv.org/pdf/2607.28036v1 | hal:https://hal.science/hal-05707013 | abstract: It is well known that Newton's method converges faster when the initial guess is closer to a root of a system of nonlinear equations. In this paper, a two-stage Newton initial guess strategy is proposed by learning features from a parameter-space sampling and a database of precomputed solutions. The method uses discrete Newton trajectories to construct two complementary reduced spaces: a solution feature space, built from converged states, and a corrective search direction feature space, built from intermediate Newton increments. For an unseen parameter, a regression model is used to predict a surrogate solution approximation. Then, in a second step, a residual-minimizing correction is computed using a dedicated GMRES-based approach. The resulting state is then used as an initial guess for the high-fidelity Newton method, which completes convergence. The corrective step is computationally inexpensive since it only requires residual evaluations and the solution of a small least-squares problem. The methodology is weakly intrusive once the high-fidelity residual fields and a script-based programming interface are available. This strategy reduces the number of Newton iterations and decreases the overall CPU time. Numerical experiments on representative PDE problems show quantifiable speedups compared with standalone surrogate initialization. Significant speedups are observed. This generic approach can be applied to a broad class of large-scale nonlinear problems.
</div>

<div class="highlight">
 | Conformal risk control for model-form uncertainty in parametric non-intrusive reduced-order models | 
 <a href="https://edgarjaber.github.io/" class="supervisor">Edgar Jaber</a>, 
 Rémy Vallot, 
 <a href="https://scholar.google.com/citations?user=L_eRA6YAAAAJ&hl=en" class="supervisor">Thibault Dairay </a>, 
 <a href="https://sites.google.com/site/mougeotmathilde/" class="supervisor">Mathilde Mougeot</a>
 | | arxiv:https://arxiv.org/abs/2608.03360 | hal:https://hal.science/hal-05710304/ | abstract: Non-intrusive reduced-order models (NIROMs) have become a standard tool for approximating parametric partial differential equations from computer design of experiments while significantly reducing computational costs. However, assessing the reliability of their predictions remains a major challenge, particularly in extrapolation regimes or under limited training data. In this work, we introduce a framework for quantifying model-form uncertainty in NIROMs by combining a perturbative stochastic representation of reduced bases with distribution-free conformal-type methods. Starting from a deterministic reduced basis constructed from snapshot matrices, we model uncertainty through random perturbations defined on the Stiefel manifold, directed along the discarded modes, yielding stochastic reduced-order approximations whose induced variance reflects the basis-truncation error. A transport approximation gives a closed-form posterior variance that sepa- rates basis-induced from regression-induced uncertainty, without re-training the underlying Gaussian processes. We include this posterior variance within a conformal risk control calibration framework, that provides prediction sets with coordinate miscoverage guarantees. The calibration factor produced by this framework is itself an interpretable, scalar diagnostic of the quality of the uncertainty estimate. The methodology is evaluated on parametric PDE benchmarks and an industrial tire-manufacturing calendering process. Numerical experiments demonstrate reliable, locally informative uncertainty quantification that goes beyond the Gaussian predictive variance.
</div>

## Talks & Posters

### 2025

<div class="highlight">
December 1–5 | Application of Digital Twins to Large-Scale Complex Systems - IMSI Chicago | Lightning talk introducing my poster on convergence acceleration using initialization strategies. | thumbnails/imsi2025_LT.jpg | pdfs/imsi2025_LT.pdf 
</div>

<div class="highlight">
December 1–5 | Application of Digital Twins to Large-Scale Complex Systems - IMSI Chicago | Presented a poster on convergence acceleration using initialization strategies and comparing the different proposed methods. | thumbnails/imsi2025.png | pdfs/imsi2025.pdf | https://hal.science/hal-05449018v1
</div>

<div class="highlight">
June 2–6 | SMAI Biennial Conference | Oral presentation of my ongoing work on convergence acceleration using initialization strategies and comparing the different proposed methods. | thumbnails/smai2025.png | pdfs/smai2025.pdf
</div>

<div class="highlight">
May 26–28 | CIROQUO Workshop | Presented a poster on convergence acceleration using initialization strategies and comparing the different proposed methods. | thumbnails/ciroquo2025.png | pdfs/ciroquo2025.pdf
</div>

<div class="highlight">
May 8 | IDAML Workshop | Talk on my ongoing research, problem description, and initialization methods. 
</div>

<div class="highlight">
February 5 | Internal Presentation at Michelin | Presented a literature review to Michelin’s internal research team.
</div>

<div class="highlight">
January 23 | MathTech Meetings | Short video presentation of my PhD topic for MathTech academic–industrial meetings. | thumbnails/pitch.png | https://youtube.com
</div>


### 2024
<div class="highlight">
November 12  | Poster at Michelin PhD Day | Poster presentation on early results of my PhD work. 
</div>


