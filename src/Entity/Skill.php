<?php

namespace App\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="App\Repository\SkillRepository")
 */
class Skill
{
    /**
     * @ORM\Id()
     * @ORM\GeneratedValue()
     * @ORM\Column(type="integer")
     */
    private $id;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private $name;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $description;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $image;

    /**
     * @ORM\Column(type="integer")
     */
    private $cost;

    /**
     * @ORM\ManyToOne(targetEntity="App\Entity\Weapon", inversedBy="skills")
     * @ORM\JoinColumn(nullable=false)
     */
    private $weapon;

    /**
     * @ORM\ManyToOne(targetEntity="App\Entity\Skill", inversedBy="childSkill")
     */
    private $skillParent;

    /**
     * @ORM\OneToMany(targetEntity="App\Entity\Skill", mappedBy="skillParent")
     */
    private $childSkill;

    public function __construct()
    {
        $this->childSkill = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): self
    {
        $this->name = $name;

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): self
    {
        $this->description = $description;

        return $this;
    }

    public function getImage(): ?string
    {
        return $this->image;
    }

    public function setImage(?string $image): self
    {
        $this->image = $image;

        return $this;
    }

    public function getCost(): ?int
    {
        return $this->cost;
    }

    public function setCost(int $cost): self
    {
        $this->cost = $cost;

        return $this;
    }

    public function getWeapon(): ?Weapon
    {
        return $this->weapon;
    }

    public function setWeapon(?Weapon $weapon): self
    {
        $this->weapon = $weapon;

        return $this;
    }

    public function getSkillParent(): ?self
    {
        return $this->skillParent;
    }

    public function setSkillParent(?self $skillParent): self
    {
        $this->skillParent = $skillParent;

        return $this;
    }

    /**
     * @return Collection|self[]
     */
    public function getChildSkill(): Collection
    {
        return $this->childSkill;
    }

    public function addChildSkill(self $childSkill): self
    {
        if (!$this->childSkill->contains($childSkill)) {
            $this->childSkill[] = $childSkill;
            $childSkill->setSkillParent($this);
        }

        return $this;
    }

    public function removeChildSkill(self $childSkill): self
    {
        if ($this->childSkill->contains($childSkill)) {
            $this->childSkill->removeElement($childSkill);
            // set the owning side to null (unless already changed)
            if ($childSkill->getSkillParent() === $this) {
                $childSkill->setSkillParent(null);
            }
        }

        return $this;
    }
}
